package auth

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

// CookieName is the session cookie's name. The app's proxy.ts checks for it
// by name.
const CookieName = "dwai_session"

// UnauthenticatedErrorCode is the GraphQL error extension code for a call
// that needs a logged-in user.
const UnauthenticatedErrorCode = "UNAUTHENTICATED"

// Session lifetime. Using a session slides its expiry back out to
// SessionLifetime, at most once per sessionRefreshInterval so requests
// don't each write to the database.
const (
	SessionLifetime        = 30 * 24 * time.Hour
	sessionRefreshInterval = 24 * time.Hour
)

// Sessions finds each request's user from its session cookie, and starts and
// ends sessions for the login and logout resolvers.
type Sessions struct {
	// Now returns the current time; tests can replace it.
	Now func() time.Time
	// Pool is the database the sessions and users are in.
	Pool *pgxpool.Pool
	// SecureCookie sets the cookie's Secure attribute. Leave it off for
	// local development over plain HTTP.
	SecureCookie bool
}

// requestState is the request's auth state, kept in its context.
type requestState struct {
	tokenHash []byte
	user      *db.User
	w         http.ResponseWriter
}

type stateKey struct{}

func stateFor(ctx context.Context) *requestState {
	state, _ := ctx.Value(stateKey{}).(*requestState)

	return state
}

// Middleware loads the session named by the request's cookie, if it's valid,
// slides its expiry, and makes its user available to UserFromContext.
func (s *Sessions) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		state := &requestState{w: w}

		if cookie, err := r.Cookie(CookieName); err == nil && cookie.Value != "" {
			if err := s.load(r.Context(), state, cookie.Value); err != nil {
				slog.ErrorContext(r.Context(), "failed to load session", "error", err)
				http.Error(w, "internal server error", http.StatusInternalServerError)
				return
			}
		}

		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), stateKey{}, state)))
	})
}

// load looks up a session token. A missing or expired session leaves the
// request logged out and clears the stale cookie.
func (s *Sessions) load(ctx context.Context, state *requestState, token string) error {
	queries := db.New(s.Pool)
	hash := HashToken(token)

	row, err := queries.SelectSessionUser(ctx, hash)
	if errors.Is(err, pgx.ErrNoRows) {
		// Expired sessions are deleted when next presented (and in bulk at
		// startup, see DeleteExpired).
		if err := queries.DeleteSession(ctx, hash); err != nil {
			return fmt.Errorf("delete session: %w", err)
		}
		s.clearCookie(state.w)
		return nil
	}
	if err != nil {
		return fmt.Errorf("select session: %w", err)
	}

	state.tokenHash = hash
	state.user = &row.User

	expiresAt := s.Now().Add(SessionLifetime)
	if expiresAt.Sub(row.ExpiresAt.Time) >= sessionRefreshInterval {
		err := queries.ExtendSession(ctx, db.ExtendSessionParams{
			ExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
			TokenHash: hash,
		})
		if err != nil {
			return fmt.Errorf("extend session: %w", err)
		}
		s.setCookie(state.w, token, expiresAt)
	}

	return nil
}

// LogIn starts a session for user and sets the cookie on the response. The
// rest of the request sees the user as logged in.
func (s *Sessions) LogIn(ctx context.Context, user *db.User) error {
	state := stateFor(ctx)
	if state == nil {
		return errors.New("request didn't go through the auth middleware")
	}

	queries := db.New(s.Pool)

	// Replace any session the request already had, so logging in as
	// someone else doesn't leave the old one behind.
	if state.tokenHash != nil {
		if err := queries.DeleteSession(ctx, state.tokenHash); err != nil {
			return fmt.Errorf("delete previous session: %w", err)
		}
	}

	token, hash := NewToken()
	expiresAt := s.Now().Add(SessionLifetime)

	err := queries.InsertSession(ctx, db.InsertSessionParams{
		ExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
		TokenHash: hash,
		UserID:    user.ID,
	})
	if err != nil {
		return fmt.Errorf("insert session: %w", err)
	}

	state.tokenHash = hash
	state.user = user
	s.setCookie(state.w, token, expiresAt)

	return nil
}

// LogOut ends the request's session, if any, and clears the cookie.
func (s *Sessions) LogOut(ctx context.Context) error {
	state := stateFor(ctx)
	if state == nil {
		return errors.New("request didn't go through the auth middleware")
	}

	if state.tokenHash != nil {
		if err := db.New(s.Pool).DeleteSession(ctx, state.tokenHash); err != nil {
			return fmt.Errorf("delete session: %w", err)
		}
	}

	state.tokenHash = nil
	state.user = nil
	s.clearCookie(state.w)

	return nil
}

// DeleteExpired deletes every expired session, returning how many.
func (s *Sessions) DeleteExpired(ctx context.Context) (int64, error) {
	return db.New(s.Pool).DeleteExpiredSessions(ctx)
}

func (s *Sessions) setCookie(w http.ResponseWriter, token string, expiresAt time.Time) {
	http.SetCookie(w, &http.Cookie{
		Expires:  expiresAt,
		HttpOnly: true,
		MaxAge:   int(expiresAt.Sub(s.Now()).Seconds()),
		Name:     CookieName,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		Secure:   s.SecureCookie,
		Value:    token,
	})
}

func (s *Sessions) clearCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		HttpOnly: true,
		MaxAge:   -1,
		Name:     CookieName,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		Secure:   s.SecureCookie,
	})
}

// UserFromContext returns the logged-in user, or nil.
func UserFromContext(ctx context.Context) *db.User {
	if state := stateFor(ctx); state != nil {
		return state.user
	}

	return nil
}

// RequireUser returns the logged-in user, or an UNAUTHENTICATED error.
func RequireUser(ctx context.Context) (*db.User, error) {
	if user := UserFromContext(ctx); user != nil {
		return user, nil
	}

	return nil, &gqlerror.Error{
		Message:    "You must be logged in",
		Extensions: map[string]any{"code": UnauthenticatedErrorCode},
	}
}
