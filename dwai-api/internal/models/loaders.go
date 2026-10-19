package models

import (
	"context"
	"net/http"
	"time"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/vikstrous/dataloadgen"
)

// Loaders batch and cache database reads. They're created per request (see
// LoadersMiddleware), so cached results never outlive the request that
// loaded them.
type Loaders struct {
	CharacterLoader                *dataloadgen.Loader[pgtype.UUID, *db.Character]
	LookLoader                     *dataloadgen.Loader[int32, *db.Look]
	MoveCreationOptionChoiceLoader *dataloadgen.Loader[int32, *db.MoveCreationOptionChoice]
}

func NewLoaders(pool *pgxpool.Pool) *Loaders {
	cl := NewCharacterLoader(db.New(pool))
	ll := NewLookLoader(db.New(pool))
	mcocl := NewMoveCreationOptionChoiceLoader(db.New(pool))

	return &Loaders{
		CharacterLoader:                dataloadgen.NewMappedLoader(cl.loadCharacters, dataloadgen.WithWait(time.Millisecond)),
		LookLoader:                     dataloadgen.NewMappedLoader(ll.loadLooks, dataloadgen.WithWait(time.Millisecond)),
		MoveCreationOptionChoiceLoader: dataloadgen.NewMappedLoader(mcocl.loadMoveCreationOptionChoices, dataloadgen.WithWait(time.Millisecond)),
	}
}

type loadersKey struct{}

// LoadersMiddleware gives each request its own Loaders, retrieved in
// resolvers with LoadersFor.
func LoadersMiddleware(pool *pgxpool.Pool, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), loadersKey{}, NewLoaders(pool))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// LoadersFor returns the request's Loaders. It panics if the request didn't
// go through LoadersMiddleware.
func LoadersFor(ctx context.Context) *Loaders {
	return ctx.Value(loadersKey{}).(*Loaders)
}
