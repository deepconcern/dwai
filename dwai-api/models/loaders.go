package models

import (
	"time"

	"github.com/deepconcern/dwai/dwai-api/db"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/vikstrous/dataloadgen"
)

type Loaders struct {
	CharacterLoader *dataloadgen.Loader[pgtype.UUID, *db.Character]
	LookLoader      *dataloadgen.Loader[int32, *db.Look]
}

func NewLoaders(pool *pgxpool.Pool) *Loaders {
	cl := NewCharacterLoader(db.New(pool))
	ll := NewLookLoader(db.New(pool))

	return &Loaders{
		CharacterLoader: dataloadgen.NewLoader(cl.loadCharacters, dataloadgen.WithWait(time.Millisecond)),
		LookLoader:      dataloadgen.NewLoader(ll.loadLooks, dataloadgen.WithWait(time.Millisecond)),
	}
}
