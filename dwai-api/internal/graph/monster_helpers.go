package graph

// Helpers for the monster compendium, custom monsters, and monsters in play.
// This file isn't generated.

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// monsterObject converts a stat block to a GraphQL object.
func monsterObject(id string, source model.MonsterSource, sourceKey string, setting *models.MonsterSetting, stats *models.MonsterStatBlock) *model.Monster {
	object := &model.Monster{
		Armor:            stats.Armor,
		Description:      stats.Description,
		Hp:               stats.HP,
		ID:               id,
		Instinct:         stats.Instinct,
		Moves:            nonNil(stats.Moves),
		Name:             stats.Name,
		Source:           source,
		SpecialQualities: nonNil(stats.SpecialQualities),
		Tags:             nonNil(stats.Tags),
	}
	if sourceKey != "" {
		object.SourceKey = &sourceKey
	}
	if setting != nil {
		object.Setting = &model.MonsterSetting{Key: setting.Key, Name: setting.Name}
	}
	if a := stats.Attack; a != nil {
		object.Attack = &model.MonsterAttack{
			Damage:       a.Damage,
			IgnoresArmor: a.IgnoresArmor,
			Name:         a.Name,
			Piercing:     a.Piercing,
			Tags:         nonNil(a.Tags),
		}
	}

	return object
}

// nonNil returns list, or an empty list for nil.
func nonNil(list []string) []string {
	if list == nil {
		return []string{}
	}

	return list
}

// compendiumMonsterObject converts a compendium monster to a GraphQL object.
func (r *Resolver) compendiumMonsterObject(m *models.CompendiumMonster) *model.Monster {
	return monsterObject(m.Key, model.MonsterSourceCompendium, m.Key, r.Monsters.Setting(m.SettingKey), &m.MonsterStatBlock)
}

// customMonsterObject converts a custom monster row to a GraphQL object.
func customMonsterObject(row *db.CustomMonster) (*model.Monster, error) {
	var stats models.MonsterStatBlock
	if err := json.Unmarshal(row.StatBlock, &stats); err != nil {
		return nil, fmt.Errorf("failed to read custom monster '%s': %w", row.ID.String(), err)
	}

	return monsterObject(row.ID.String(), model.MonsterSourceCustom, row.SourceKey.String, nil, &stats), nil
}

// campaignMonsterObject converts a monster in play to a GraphQL object.
func (r *Resolver) campaignMonsterObject(row *db.CampaignMonster) (*model.CampaignMonster, error) {
	stats, err := campaignMonsterStats(row)
	if err != nil {
		return nil, err
	}

	return &model.CampaignMonster{
		CreatedAt:   row.CreatedAt.Time,
		EncounterID: uuidPtr(row.EncounterID),
		Hp:          row.Hp,
		ID:          row.ID.String(),
		MaxHp:       row.MaxHp,
		Name:        row.Name,
		StatBlock:   r.snapshotObject(row.ID.String(), row.CustomMonsterID, row.SourceKey, stats),
	}, nil
}

// snapshotObject converts a stat block snapshot (a monster in play or in an
// encounter) to a GraphQL object. It counts as a compendium monster when it
// was taken from one directly.
func (r *Resolver) snapshotObject(id string, customMonsterID pgtype.UUID, sourceKey pgtype.Text, stats *models.MonsterStatBlock) *model.Monster {
	source := model.MonsterSourceCustom
	var setting *models.MonsterSetting
	if !customMonsterID.Valid && sourceKey.Valid {
		if m := r.Monsters.Find(sourceKey.String); m != nil {
			source = model.MonsterSourceCompendium
			setting = r.Monsters.Setting(m.SettingKey)
		}
	}

	return monsterObject(id, source, sourceKey.String, setting, stats)
}

// campaignMonsterStats reads a monster in play's stat block.
func campaignMonsterStats(row *db.CampaignMonster) (*models.MonsterStatBlock, error) {
	var stats models.MonsterStatBlock
	if err := json.Unmarshal(row.StatBlock, &stats); err != nil {
		return nil, fmt.Errorf("failed to read monster in play '%s': %w", row.ID.String(), err)
	}

	return &stats, nil
}

// monsterStatBlockInput converts a custom monster's input to a stat block.
func monsterStatBlockInput(input model.MonsterInput) models.MonsterStatBlock {
	stats := models.MonsterStatBlock{
		Armor:            input.Armor,
		Description:      input.Description,
		HP:               input.Hp,
		Instinct:         input.Instinct,
		Moves:            input.Moves,
		Name:             input.Name,
		SpecialQualities: input.SpecialQualities,
		Tags:             input.Tags,
	}
	if a := input.Attack; a != nil {
		stats.Attack = &models.MonsterAttack{
			Damage:       a.Damage,
			IgnoresArmor: a.IgnoresArmor,
			Name:         a.Name,
			Piercing:     a.Piercing,
			Tags:         a.Tags,
		}
	}

	return stats
}

// validateMonsterInput checks a custom monster's input, adding each problem
// to the response. It returns the trimmed stat block and source key, and
// false if the input was invalid.
func (r *Resolver) validateMonsterInput(ctx context.Context, input model.MonsterInput) (models.MonsterStatBlock, pgtype.Text, bool) {
	stats, errs := models.ValidateMonster(monsterStatBlockInput(input))

	var sourceKey pgtype.Text
	if input.SourceKey != nil {
		if r.Monsters.Find(*input.SourceKey) == nil {
			errs = append(errs, models.ValidationError{Field: "sourceKey", Message: fmt.Sprintf("There's no compendium monster '%s'.", *input.SourceKey)})
		}
		sourceKey = pgtype.Text{String: *input.SourceKey, Valid: true}
	}

	return stats, sourceKey, !addValidationErrors(ctx, errs)
}

// loadCustomMonster loads one of the logged-in user's custom monsters.
// Anyone else's is reported as not found.
func (r *Resolver) loadCustomMonster(ctx context.Context, id string, user *db.User) (*db.CustomMonster, error) {
	uuid, err := parseUUID("custom monster", id)
	if err != nil {
		return nil, err
	}

	row, err := db.New(r.DbPool).SelectCustomMonster(ctx, uuid)
	if errors.Is(err, pgx.ErrNoRows) || (err == nil && row.OwnerUserID != user.ID) {
		return nil, fmt.Errorf("custom monster with ID '%s' %w", id, errNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load custom monster with ID '%s': %w", id, err)
	}

	return &row, nil
}

// loadCampaignMonster loads a monster in play for its campaign's GM. A
// player in the campaign gets errGMOnly; anyone else, not found.
func (r *Resolver) loadCampaignMonster(ctx context.Context, id string) (*db.CampaignMonster, *db.Campaign, *db.User, error) {
	uuid, err := parseUUID("monster", id)
	if err != nil {
		return nil, nil, nil, err
	}

	row, err := db.New(r.DbPool).SelectCampaignMonster(ctx, uuid)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil, nil, fmt.Errorf("monster with ID '%s' %w", id, errNotFound)
	}
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to load monster with ID '%s': %w", id, err)
	}

	campaign, user, err := r.loadCampaign(ctx, row.CampaignID, true)
	if err != nil {
		return nil, nil, nil, err
	}

	return &row, campaign, user, nil
}

// monsterSource is the stat block that monsters are added to play from.
type monsterSource struct {
	customMonsterID pgtype.UUID
	sourceKey       pgtype.Text
	stats           models.MonsterStatBlock
}

// findMonsterSource looks up the compendium monster or custom monster that
// AddMonstersInput names. A custom monster must be the GM's own.
func (r *Resolver) findMonsterSource(ctx context.Context, input model.AddMonstersInput, user *db.User) (*monsterSource, error) {
	switch {
	case (input.CompendiumKey == nil) == (input.CustomMonsterID == nil):
		return nil, models.ValidationError{Field: "compendiumKey", Message: "Choose a compendium monster or one of your own."}
	case input.CompendiumKey != nil:
		m := r.Monsters.Find(*input.CompendiumKey)
		if m == nil {
			return nil, models.ValidationError{Field: "compendiumKey", Message: fmt.Sprintf("There's no compendium monster '%s'.", *input.CompendiumKey)}
		}
		return &monsterSource{sourceKey: pgtype.Text{String: m.Key, Valid: true}, stats: m.MonsterStatBlock}, nil
	}

	row, err := r.loadCustomMonster(ctx, *input.CustomMonsterID, user)
	if err != nil {
		return nil, err
	}

	var stats models.MonsterStatBlock
	if err := json.Unmarshal(row.StatBlock, &stats); err != nil {
		return nil, fmt.Errorf("failed to read custom monster '%s': %w", row.ID.String(), err)
	}

	return &monsterSource{customMonsterID: row.ID, sourceKey: row.SourceKey, stats: stats}, nil
}

// validateAddMonsters checks the count and max HP of monsters being added,
// returning each one's max HP.
func validateAddMonsters(input model.AddMonstersInput, stats *models.MonsterStatBlock) (int32, []models.ValidationError) {
	var errs []models.ValidationError

	if input.Count < 1 || input.Count > models.MaxMonsterCount {
		errs = append(errs, models.ValidationError{Field: "count", Message: fmt.Sprintf("Add 1 to %d at a time.", models.MaxMonsterCount)})
	}

	maxHP := stats.HP
	if input.MaxHp != nil {
		maxHP = input.MaxHp
	}
	switch {
	case maxHP == nil:
		errs = append(errs, models.ValidationError{Field: "maxHp", Message: fmt.Sprintf("%s has no HP; enter its max HP.", stats.Name)})
	case *maxHP < 1 || *maxHP > models.MaxMonsterHP:
		errs = append(errs, models.ValidationError{Field: "maxHp", Message: fmt.Sprintf("Max HP must be from 1 to %d.", models.MaxMonsterHP)})
	}

	if len(errs) > 0 {
		return 0, errs
	}

	return *maxHP, nil
}

// setMonsterHP saves a monster in play's new HP and returns it.
func (r *Resolver) setMonsterHP(ctx context.Context, row *db.CampaignMonster, hp int32) (*model.CampaignMonster, error) {
	updated, err := db.New(r.DbPool).UpdateCampaignMonsterHP(ctx, db.UpdateCampaignMonsterHPParams{ID: row.ID, Hp: hp})
	if err != nil {
		return nil, fmt.Errorf("failed to update monster with ID '%s': %w", row.ID.String(), err)
	}

	return r.campaignMonsterObject(&updated)
}
