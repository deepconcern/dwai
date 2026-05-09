package models

import (
	"context"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CharacterModel struct {
	Charisma     int32
	Constitution int32
	Dexterity    int32
	ID           string
	Intelligence int32
	Name         string
	Strength     int32
	Wisdom       int32
}

func (c *CharacterModel) ToObject() *model.Character {
	abilities := []*model.AbilityScore{
		{Ability: model.AbilityCharisma, Score: c.Charisma},
		{Ability: model.AbilityConstitution, Score: c.Constitution},
		{Ability: model.AbilityDexterity, Score: c.Dexterity},
		{Ability: model.AbilityIntelligence, Score: c.Intelligence},
		{Ability: model.AbilityStrength, Score: c.Strength},
		{Ability: model.AbilityWisdom, Score: c.Wisdom},
	}

	return &model.Character{
		Abilities: abilities,
		ID:        c.ID,
		Name:      c.Name,
	}
}

type characterLoader struct {
	dbPool *pgxpool.Pool
}

func (c *characterLoader) loadCharacters(ctx context.Context, keys []string) ([]*CharacterModel, []error) {
	// Database query for all keys

	rows, err := c.dbPool.Query(context.Background(), `
		SELECT charisma, constitution, dexterity, id, intelligence, name, strength, wisdom
		FROM characters WHERE id = ANY($1)
	`, keys)
	if err != nil {
		return nil, []error{err}
	}
	defer rows.Close()

	// Extract characters from rows

	characters := make([]*CharacterModel, 0)
	for rows.Next() {
		var character CharacterModel

		if err := rows.Scan(&character.Charisma, &character.Constitution, &character.Dexterity, &character.ID, &character.Intelligence, &character.Name, &character.Strength, &character.Wisdom); err != nil {
			return nil, []error{err}
		}
		characters = append(characters, &character)
	}

	return characters, nil
}

func NewCharacterLoader(dbPool *pgxpool.Pool) *characterLoader {
	return &characterLoader{dbPool: dbPool}
}
