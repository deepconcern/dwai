package models

import (
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/vikstrous/dataloadgen"
)

type Loaders struct {
	CharacterLoader *dataloadgen.Loader[string, *CharacterModel]
}

func NewLoaders(dbPool *pgxpool.Pool) *Loaders {
	cl := NewCharacterLoader(dbPool)

	return &Loaders{
		CharacterLoader: dataloadgen.NewLoader(cl.loadCharacters, dataloadgen.WithWait(time.Millisecond)),
	}
}
