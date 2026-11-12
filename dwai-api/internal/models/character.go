package models

import (
	"context"
	"fmt"
	"strconv"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
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

	debilities := make([]model.Debility, len(c.Debilities))
	for i, d := range c.Debilities {
		debilities[i] = model.Debility(d)
	}

	return &model.Character{
		Abilities:            abilities,
		AlignmentDescription: c.AlignmentDescription,
		AlignmentType:        c.AlignmentType,
		Debilities:           debilities,
		Gold:                 c.Gold,
		HitPoints:            c.HitPoints,
		ID:                   c.ID.String(),
		IsDying:              c.HitPoints <= 0,
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

// The fetch functions return results keyed by ID: the queries' `= ANY(...)`
// returns rows in no particular order, and dataloadgen's mapped loaders
// line results up with the requested keys (and report missing keys as
// dataloadgen.ErrNotFound).

func (c *characterLoader) loadCharacters(ctx context.Context, keys []pgtype.UUID) (map[pgtype.UUID]*db.Character, error) {
	rows, err := c.queries.LoadCharacters(ctx, keys)
	if err != nil {
		return nil, fmt.Errorf("failed to load characters: %w", err)
	}

	characters := make(map[pgtype.UUID]*db.Character, len(rows))
	for i := range rows {
		characters[rows[i].ID] = &rows[i]
	}

	return characters, nil
}

func (l *lookLoader) loadLooks(ctx context.Context, keys []int32) (map[int32]*db.Look, error) {
	rows, err := l.queries.LoadLooks(ctx, keys)
	if err != nil {
		return nil, fmt.Errorf("failed to load looks: %w", err)
	}

	looks := make(map[int32]*db.Look, len(rows))
	for _, row := range rows {
		looks[row.ID] = &db.Look{
			CharacterID: row.CharacterID,
			ID:          row.ID,
			LookType:    row.LookType,
			Value:       row.Value,
		}
	}

	return looks, nil
}

func (m *moveCreationOptionChoiceLoader) loadMoveCreationOptionChoices(ctx context.Context, keys []int32) (map[int32]*db.MoveCreationOptionChoice, error) {
	rows, err := m.queries.LoadMoveCreationOptionChoices(ctx, keys)
	if err != nil {
		return nil, fmt.Errorf("failed to load move creation option choices: %w", err)
	}

	choices := make(map[int32]*db.MoveCreationOptionChoice, len(rows))
	for _, row := range rows {
		choices[row.ID] = &db.MoveCreationOptionChoice{
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
