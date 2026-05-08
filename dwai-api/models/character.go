package models

import (
	"context"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CharacterModel struct {
	ID   string
	Name string
}

func (c *CharacterModel) ToObject() *model.Character {
	return &model.Character{
		ID:   c.ID,
		Name: c.Name,
	}
}

type characterLoader struct {
	dbPool *pgxpool.Pool
}

func (c *characterLoader) loadCharacters(ctx context.Context, keys []string) ([]*CharacterModel, []error) {
	// Database query for all keys

	rows, err := c.dbPool.Query(context.Background(), "SELECT id, name FROM characters WHERE id = ANY($1)", keys)
	if err != nil {
		return nil, []error{err}
	}
	defer rows.Close()

	// Extract characters from rows

	characters := make([]*CharacterModel, 0)
	for rows.Next() {
		var character CharacterModel
		if err := rows.Scan(&character.ID, &character.Name); err != nil {
			return nil, []error{err}
		}
		characters = append(characters, &character)
	}

	return characters, nil
}

func NewCharacterLoader(dbPool *pgxpool.Pool) *characterLoader {
	return &characterLoader{dbPool: dbPool}
}
