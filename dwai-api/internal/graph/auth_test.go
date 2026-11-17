//go:build integration

package graph_test

import (
	"bytes"
	"context"
	"crypto/sha256"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/auth"
	"github.com/deepconcern/dwai/dwai-api/internal/testutil"
	"github.com/jackc/pgx/v5"
)

const registerMutation = `
mutation ($input: RegisterInput!) {
	auth { register(input: $input) { displayName email id } }
}`

const loginMutation = `
mutation ($input: LoginInput!) {
	auth { login(input: $input) { displayName email id } }
}`

const logoutMutation = `mutation { auth { logout } }`

const meQuery = `{ me { displayName email id } }`

type userResponse struct {
	DisplayName string
	Email       string
	ID          string
}

// me returns the logged-in user, or nil.
func me(t *testing.T, c *client.Client) *userResponse {
	t.Helper()

	var resp struct{ Me *userResponse }
	if err := c.Post(meQuery, &resp); err != nil {
		t.Fatalf("me: %v", err)
	}

	return resp.Me
}

func login(c *client.Client, email, password string) (*userResponse, error) {
	var resp struct {
		Auth struct{ Login *userResponse }
	}
	err := c.Post(loginMutation, &resp, client.Var("input", map[string]any{"email": email, "password": password}))

	return resp.Auth.Login, err
}

func logout(t *testing.T, c *client.Client) {
	t.Helper()

	var resp struct{ Auth struct{ Logout bool } }
	if err := c.Post(logoutMutation, &resp); err != nil {
		t.Fatalf("logout: %v", err)
	}
	if !resp.Auth.Logout {
		t.Error("logout returned false, want true")
	}
}

func TestRegisterLogsIn(t *testing.T) {
	t.Parallel()

	h, pool := env.NewServer(t)
	browser := testutil.NewBrowser(h)

	if got := me(t, browser.Client); got != nil {
		t.Fatalf("me = %+v before registering, want null", got)
	}

	var resp struct {
		Auth struct{ Register userResponse }
	}
	err := browser.Client.Post(registerMutation, &resp, client.Var("input", map[string]any{
		"displayName": "  Grog  ",
		"email":       " Grog@Example.com ",
		"password":    testutil.TestPassword,
	}))
	if err != nil {
		t.Fatalf("register: %v", err)
	}

	want := userResponse{DisplayName: "Grog", Email: "Grog@Example.com", ID: resp.Auth.Register.ID}
	if resp.Auth.Register != want {
		t.Errorf("register returned %+v, want %+v", resp.Auth.Register, want)
	}

	if got := me(t, browser.Client); got == nil || *got != want {
		t.Errorf("me = %+v after registering, want %+v", got, want)
	}

	// Only an argon2id hash of the password is stored.
	var hash string
	if err := pool.QueryRow(t.Context(), "SELECT password_hash FROM users").Scan(&hash); err != nil {
		t.Fatalf("select password hash: %v", err)
	}
	if !strings.HasPrefix(hash, "$argon2id$") || strings.Contains(hash, testutil.TestPassword) {
		t.Errorf("password_hash = %q, want an argon2id hash", hash)
	}
}

func TestRegisterValidation(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	browser := testutil.NewBrowser(h)
	browser.Register(t, "taken@example.com")

	tests := []struct {
		name  string
		input map[string]any
		field string
	}{
		{"blank display name", map[string]any{"displayName": "  ", "email": "a@example.com", "password": testutil.TestPassword}, "displayName"},
		{"long display name", map[string]any{"displayName": strings.Repeat("a", 51), "email": "a@example.com", "password": testutil.TestPassword}, "displayName"},
		{"bad email", map[string]any{"displayName": "A", "email": "not an email", "password": testutil.TestPassword}, "email"},
		{"email without a domain", map[string]any{"displayName": "A", "email": "a@localhost", "password": testutil.TestPassword}, "email"},
		{"short password", map[string]any{"displayName": "A", "email": "a@example.com", "password": "1234567"}, "password"},
		{"long password", map[string]any{"displayName": "A", "email": "a@example.com", "password": strings.Repeat("a", 129)}, "password"},
		{"email taken, ignoring case", map[string]any{"displayName": "A", "email": "TAKEN@example.com", "password": testutil.TestPassword}, "email"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			other := testutil.NewBrowser(h)
			errs := postErrors(t, other.Client, registerMutation, client.Var("input", tt.input))
			wantValidationError(t, errs, tt.field)

			if other.SessionCookie() != nil {
				t.Error("a failed registration set a session cookie")
			}
		})
	}
}

func TestLoginAndLogout(t *testing.T) {
	t.Parallel()

	h, pool := env.NewServer(t)
	testutil.NewBrowser(h).Register(t, "player@example.com")

	browser := testutil.NewBrowser(h)

	// Email is matched ignoring case and surrounding space.
	user, err := login(browser.Client, " PLAYER@example.com", testutil.TestPassword)
	if err != nil {
		t.Fatalf("login: %v", err)
	}
	if user.Email != "player@example.com" {
		t.Errorf("login returned email %q, want %q", user.Email, "player@example.com")
	}
	if got := me(t, browser.Client); got == nil || got.ID != user.ID {
		t.Errorf("me = %+v after logging in, want user %s", got, user.ID)
	}

	cookie := browser.SessionCookie()
	if cookie == nil {
		t.Fatal("login set no session cookie")
	}

	// The database stores only a hash of the cookie's token.
	sum := sha256.Sum256([]byte(cookie.Value))
	var stored []byte
	if err := pool.QueryRow(t.Context(), "SELECT token_hash FROM sessions WHERE token_hash = $1", sum[:]).Scan(&stored); err != nil {
		t.Fatalf("select session by token hash: %v", err)
	}
	var raw int
	if err := pool.QueryRow(t.Context(), "SELECT count(*) FROM sessions WHERE token_hash = $1", []byte(cookie.Value)).Scan(&raw); err != nil {
		t.Fatalf("count sessions by raw token: %v", err)
	}
	if raw != 0 {
		t.Error("a session row stores the raw token")
	}

	logout(t, browser.Client)

	if got := me(t, browser.Client); got != nil {
		t.Errorf("me = %+v after logging out, want null", got)
	}
	if browser.SessionCookie() != nil {
		t.Error("logout didn't clear the session cookie")
	}
	var sessions int
	if err := pool.QueryRow(t.Context(), "SELECT count(*) FROM sessions WHERE token_hash = $1", sum[:]).Scan(&sessions); err != nil {
		t.Fatalf("count sessions: %v", err)
	}
	if sessions != 0 {
		t.Error("logout didn't delete the session row")
	}

	// The old token no longer works, even if a client kept it.
	stale := sessionClient(h, cookie.Value)
	if got := me(t, stale); got != nil {
		t.Errorf("me = %+v with a logged-out token, want null", got)
	}

	// Logging out again is harmless.
	logout(t, browser.Client)
}

func TestLoginFailuresAreIndistinguishable(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	testutil.NewBrowser(h).Register(t, "player@example.com")

	for name, creds := range map[string][2]string{
		"wrong password": {"player@example.com", "wrong password"},
		"unknown email":  {"nobody@example.com", testutil.TestPassword},
	} {
		t.Run(name, func(t *testing.T) {
			browser := testutil.NewBrowser(h)
			errs := postErrors(t, browser.Client, loginMutation, client.Var("input", map[string]any{"email": creds[0], "password": creds[1]}))

			if len(errs) != 1 || errs[0].Message != "Invalid email or password" {
				t.Errorf("errors = %v, want one \"Invalid email or password\"", errs)
			}
			if browser.SessionCookie() != nil {
				t.Error("a failed login set a session cookie")
			}
		})
	}
}

func TestSessionCookieAttributes(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)

	body := `{"query":"mutation { auth { register(input: {displayName: \"A\", email: \"a@example.com\", password: \"` + testutil.TestPassword + `\"}) { id } } }"}`
	req, _ := http.NewRequestWithContext(t.Context(), http.MethodPost, "/graphql", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := recorder(h, req)

	var cookie *http.Cookie
	for _, c := range rec.Result().Cookies() {
		if c.Name == auth.CookieName {
			cookie = c
		}
	}
	if cookie == nil {
		t.Fatalf("register set no %s cookie; body %s", auth.CookieName, rec.Body)
	}

	if !cookie.HttpOnly {
		t.Error("cookie isn't HttpOnly")
	}
	if cookie.SameSite != http.SameSiteLaxMode {
		t.Errorf("SameSite = %v, want Lax", cookie.SameSite)
	}
	if cookie.Path != "/" {
		t.Errorf("Path = %q, want /", cookie.Path)
	}
	if want := int(auth.SessionLifetime.Seconds()); cookie.MaxAge < want-60 || cookie.MaxAge > want {
		t.Errorf("MaxAge = %d, want about %d", cookie.MaxAge, want)
	}
	if len(cookie.Value) < 43 { // 32 random bytes, base64url
		t.Errorf("token %q is shorter than 256 bits", cookie.Value)
	}
}

func TestExpiredSessionIsRejected(t *testing.T) {
	t.Parallel()

	h, pool := env.NewServer(t)
	browser := testutil.NewBrowser(h)
	browser.Register(t, "player@example.com")
	token := browser.SessionCookie().Value

	if _, err := pool.Exec(t.Context(), "UPDATE sessions SET expires_at = now() - interval '1 second'"); err != nil {
		t.Fatalf("expire session: %v", err)
	}

	if got := me(t, sessionClient(h, token)); got != nil {
		t.Errorf("me = %+v with an expired session, want null", got)
	}

	var sessions int
	if err := pool.QueryRow(t.Context(), "SELECT count(*) FROM sessions").Scan(&sessions); err != nil {
		t.Fatalf("count sessions: %v", err)
	}
	if sessions != 0 {
		t.Error("the expired session wasn't deleted")
	}
}

func TestSessionExpirySlides(t *testing.T) {
	t.Parallel()

	h, pool := env.NewServer(t)
	browser := testutil.NewBrowser(h)
	browser.Register(t, "player@example.com")

	// A session used within the last day isn't extended (no write per
	// request), but an older one is pushed back out to the full lifetime.
	if _, err := pool.Exec(t.Context(), "UPDATE sessions SET expires_at = now() + interval '29 days 23 hours'"); err != nil {
		t.Fatalf("age session: %v", err)
	}
	me(t, browser.Client)
	if got := sessionExpiresIn(t, pool); got > 29*24*time.Hour+23*time.Hour+time.Minute {
		t.Errorf("session used within a day was extended to %v", got)
	}

	if _, err := pool.Exec(t.Context(), "UPDATE sessions SET expires_at = now() + interval '10 days'"); err != nil {
		t.Fatalf("age session: %v", err)
	}
	me(t, browser.Client)
	if got := sessionExpiresIn(t, pool); got < auth.SessionLifetime-time.Minute {
		t.Errorf("session expires in %v after use, want about %v", got, auth.SessionLifetime)
	}
	if browser.SessionCookie() == nil {
		t.Error("extending the session dropped the cookie")
	}
}

// sessionExpiresIn returns how long until the only session expires.
func sessionExpiresIn(t *testing.T, pool interface {
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
},
) time.Duration {
	t.Helper()

	var expiresAt time.Time
	if err := pool.QueryRow(t.Context(), "SELECT expires_at FROM sessions").Scan(&expiresAt); err != nil {
		t.Fatalf("select session expiry: %v", err)
	}

	return time.Until(expiresAt)
}
