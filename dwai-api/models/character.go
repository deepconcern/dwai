package models

import (
	"context"
	"fmt"
	"strconv"

	"github.com/deepconcern/dwai/dwai-api/db"
	"github.com/deepconcern/dwai/dwai-api/graph/model"
	"github.com/jackc/pgx/v5/pgtype"
)

func ToCharacterObject(c *db.Character) *model.Character {
	abilities := []*model.AbilityScore{
		{Ability: model.AbilityCharisma, Score: c.Charisma},
		{Ability: model.AbilityConstitution, Score: c.Constitution},
		{Ability: model.AbilityDexterity, Score: c.Dexterity},
		{Ability: model.AbilityIntelligence, Score: c.Intelligence},
		{Ability: model.AbilityStrength, Score: c.Strength},
		{Ability: model.AbilityWisdom, Score: c.Wisdom},
	}

	return &model.Character{
		Abilities:            abilities,
		AlignmentDescription: c.AlignmentDescription,
		AlignmentType:        c.AlignmentType,
		HitPoints:            c.HitPoints,
		ID:                   c.ID.String(),
		Name:                 c.Name,
	}
}

func ToLookObject(l *db.Look) *model.Look {
	return &model.Look{
		ID:    strconv.Itoa(int(l.ID)),
		Value: l.Value,
	}
}

type characterLoader struct {
	queries *db.Queries
}

type lookLoader struct {
	queries *db.Queries
}

type moveCreationOptionChoiceLoader struct {
	queries *db.Queries
}

func (c *characterLoader) loadCharacters(ctx context.Context, keys []pgtype.UUID) ([]*db.Character, []error) {
	// Database query for all keys
	rows, err := c.queries.LoadCharacters(ctx, keys)
	if err != nil {
		errors := make([]error, len(keys))
		for i := range errors {
			errors[i] = fmt.Errorf("Failed to load character with ID '%s': %w", keys[i].String(), err)
		}
		return nil, errors
	}

	characters := make([]*db.Character, 0)
	for _, row := range rows {
		characters = append(characters, &db.Character{
			AlignmentDescription: row.AlignmentDescription,
			AlignmentType:        row.AlignmentType,
			CharacterClassKey:    row.CharacterClassKey,
			Charisma:             row.Charisma,
			Constitution:         row.Constitution,
			Dexterity:            row.Dexterity,
			HitPoints:            row.HitPoints,
			ID:                   row.ID,
			Intelligence:         row.Intelligence,
			Name:                 row.Name,
			RaceMoveKey:          row.RaceMoveKey,
			Strength:             row.Strength,
			Wisdom:               row.Wisdom,
		})
	}

	return characters, nil
}

func (l *lookLoader) loadLooks(ctx context.Context, keys []int32) ([]*db.Look, []error) {
	rows, err := l.queries.LoadLooks(ctx, keys)
	if err != nil {
		errors := make([]error, len(keys))
		for i := range errors {
			errors[i] = fmt.Errorf("Failed to load look with ID '%d': %w", keys[i], err)
		}
		return nil, errors
	}

	looks := make([]*db.Look, len(rows))
	for i, row := range rows {
		looks[i] = &db.Look{
			CharacterID: row.CharacterID,
			ID:          row.ID,
			LookType:    row.LookType,
			Value:       row.Value,
		}
	}

	return looks, nil
}

func (m *moveCreationOptionChoiceLoader) loadMoveCreationOptionChoices(ctx context.Context, keys []int32) ([]*db.MoveCreationOptionChoice, []error) {
	rows, err := m.queries.LoadMoveCreationOptionChoices(ctx, keys)
	if err != nil {
		errors := make([]error, len(keys))
		for i := range errors {
			errors[i] = fmt.Errorf("Failed to load move creation option choice with ID '%d': %w", keys[i], err)
		}
		return nil, errors
	}

	choices := make([]*db.MoveCreationOptionChoice, len(rows))
	for i, row := range rows {
		choices[i] = &db.MoveCreationOptionChoice{
			CharacterID: row.CharacterID,
			ChoiceIndex: row.ChoiceIndex,
			ID:          row.ID,
			MoveKey:     row.MoveKey,
			OptionKey:   row.OptionKey,
		}
	}

	return choices, nil
}

func NewCharacterLoader(queries *db.Queries) *characterLoader {
	return &characterLoader{queries: queries}
}

func NewLookLoader(queries *db.Queries) *lookLoader {
	return &lookLoader{queries: queries}
}

func NewMoveCreationOptionChoiceLoader(queries *db.Queries) *moveCreationOptionChoiceLoader {
	return &moveCreationOptionChoiceLoader{queries: queries}
}
