package graph

// Helpers for fronts, dangers, grim portents, and encounters: the GM's prep
// for a campaign. This file isn't generated.

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// uuidPtr converts a nullable UUID column to a nullable GraphQL ID.
func uuidPtr(id pgtype.UUID) *string {
	if !id.Valid {
		return nil
	}

	s := id.String()
	return &s
}

// dangerCategoryObject converts a template category to a GraphQL object.
func dangerCategoryObject(c *models.DangerCategory) *model.DangerCategory {
	types := make([]*model.DangerType, len(c.Types))
	for i, t := range c.Types {
		types[i] = &model.DangerType{Impulse: t.Impulse, Key: t.Key, Name: t.Name}
	}

	return &model.DangerCategory{Key: c.Key, Moves: nonNil(c.Moves), Name: c.Name, Types: types}
}

// dangerObject converts a danger and its portents (in order) to a GraphQL
// object.
func (r *Resolver) dangerObject(row *db.Danger, portents []db.GrimPortent) *model.Danger {
	object := &model.Danger{
		CreatedAt:     row.CreatedAt.Time,
		FrontID:       uuidPtr(row.FrontID),
		ID:            row.ID.String(),
		ImpendingDoom: row.ImpendingDoom,
		Impulse:       row.Impulse,
		Name:          row.Name,
		Notes:         row.Notes,
		Portents:      make([]*model.GrimPortent, len(portents)),
		Revealed:      row.RevealedAt.Valid,
		Type:          row.Type,
	}
	if c := r.DangerTemplate.CategoryOf(row.Type); c != nil {
		object.Category = dangerCategoryObject(c)
	}
	for i, p := range portents {
		object.Portents[i] = &model.GrimPortent{Done: p.DoneAt.Valid, ID: p.ID.String(), Revealed: p.RevealedAt.Valid, Text: p.Text}
	}

	return object
}

// portentsByDanger loads the portents of dangers, in order, keyed by danger.
func portentsByDanger(ctx context.Context, queries *db.Queries, dangers []db.Danger) (map[pgtype.UUID][]db.GrimPortent, error) {
	ids := make([]pgtype.UUID, len(dangers))
	for i, d := range dangers {
		ids[i] = d.ID
	}

	rows, err := queries.SelectGrimPortentsByDangers(ctx, ids)
	if err != nil {
		return nil, fmt.Errorf("failed to load grim portents: %w", err)
	}

	byDanger := map[pgtype.UUID][]db.GrimPortent{}
	for _, p := range rows {
		byDanger[p.DangerID] = append(byDanger[p.DangerID], p)
	}

	return byDanger, nil
}

// campaignDangers loads every danger of a campaign as GraphQL objects,
// oldest first.
func (r *Resolver) campaignDangers(ctx context.Context, queries *db.Queries, campaignID pgtype.UUID) ([]*model.Danger, error) {
	rows, err := queries.SelectDangersByCampaign(ctx, campaignID)
	if err != nil {
		return nil, fmt.Errorf("failed to load dangers: %w", err)
	}

	portents, err := portentsByDanger(ctx, queries, rows)
	if err != nil {
		return nil, err
	}

	dangers := make([]*model.Danger, len(rows))
	for i := range rows {
		dangers[i] = r.dangerObject(&rows[i], portents[rows[i].ID])
	}

	return dangers, nil
}

// dangerByID loads one danger as a GraphQL object.
func (r *Resolver) dangerByID(ctx context.Context, queries *db.Queries, id pgtype.UUID) (*model.Danger, error) {
	row, err := queries.SelectDanger(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to load danger with ID '%s': %w", id.String(), err)
	}

	portents, err := portentsByDanger(ctx, queries, []db.Danger{row})
	if err != nil {
		return nil, err
	}

	return r.dangerObject(&row, portents[row.ID]), nil
}

// frontObject converts a front and its dangers to a GraphQL object.
func frontObject(row *db.Front, dangers []*model.Danger) (*model.Front, error) {
	var stakes []models.Stake
	if err := json.Unmarshal(row.Stakes, &stakes); err != nil {
		return nil, fmt.Errorf("failed to read the stakes of front '%s': %w", row.ID.String(), err)
	}

	object := &model.Front{
		CreatedAt: row.CreatedAt.Time,
		Dangers:   dangers,
		ID:        row.ID.String(),
		Kind:      model.FrontKind(row.Kind),
		Name:      row.Name,
		Notes:     row.Notes,
		Resolved:  row.ResolvedAt.Valid,
		Stakes:    make([]*model.Stake, len(stakes)),
	}
	for i, s := range stakes {
		object.Stakes[i] = &model.Stake{Answer: s.Answer, Question: s.Question}
	}

	return object, nil
}

// frontWithDangers converts a front to a GraphQL object with its dangers.
func (r *Resolver) frontWithDangers(ctx context.Context, queries *db.Queries, row *db.Front) (*model.Front, error) {
	all, err := r.campaignDangers(ctx, queries, row.CampaignID)
	if err != nil {
		return nil, err
	}

	id := row.ID.String()
	dangers := []*model.Danger{}
	for _, d := range all {
		if d.FrontID != nil && *d.FrontID == id {
			dangers = append(dangers, d)
		}
	}

	return frontObject(row, dangers)
}

// encounterObjects converts encounters to GraphQL objects, with their
// monsters and linked dangers.
func (r *Resolver) encounterObjects(ctx context.Context, queries *db.Queries, campaignID pgtype.UUID, rows []db.Encounter) ([]*model.Encounter, error) {
	ids := make([]pgtype.UUID, len(rows))
	for i, e := range rows {
		ids[i] = e.ID
	}

	monsterRows, err := queries.SelectEncounterMonstersByEncounters(ctx, ids)
	if err != nil {
		return nil, fmt.Errorf("failed to load encounter monsters: %w", err)
	}
	monsters := map[pgtype.UUID][]*model.EncounterMonster{}
	for i := range monsterRows {
		m, err := r.encounterMonsterObject(&monsterRows[i])
		if err != nil {
			return nil, err
		}
		monsters[monsterRows[i].EncounterID] = append(monsters[monsterRows[i].EncounterID], m)
	}

	dangers := map[string]*model.Danger{}
	if len(rows) > 0 {
		all, err := r.campaignDangers(ctx, queries, campaignID)
		if err != nil {
			return nil, err
		}
		for _, d := range all {
			dangers[d.ID] = d
		}
	}

	encounters := make([]*model.Encounter, len(rows))
	for i, e := range rows {
		encounters[i] = &model.Encounter{
			CreatedAt: e.CreatedAt.Time,
			ID:        e.ID.String(),
			Location:  e.Location,
			Monsters:  monsters[e.ID],
			Name:      e.Name,
			Notes:     e.Notes,
		}
		if encounters[i].Monsters == nil {
			encounters[i].Monsters = []*model.EncounterMonster{}
		}
		if e.DangerID.Valid {
			encounters[i].Danger = dangers[e.DangerID.String()]
		}
	}

	return encounters, nil
}

// encounterByID loads one encounter as a GraphQL object.
func (r *Resolver) encounterByID(ctx context.Context, queries *db.Queries, id pgtype.UUID) (*model.Encounter, error) {
	row, err := queries.SelectEncounter(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to load encounter with ID '%s': %w", id.String(), err)
	}

	encounters, err := r.encounterObjects(ctx, queries, row.CampaignID, []db.Encounter{row})
	if err != nil {
		return nil, err
	}

	return encounters[0], nil
}

// encounterMonsterObject converts an encounter's monster to a GraphQL
// object.
func (r *Resolver) encounterMonsterObject(row *db.EncounterMonster) (*model.EncounterMonster, error) {
	var stats models.MonsterStatBlock
	if err := json.Unmarshal(row.StatBlock, &stats); err != nil {
		return nil, fmt.Errorf("failed to read encounter monster '%s': %w", row.ID.String(), err)
	}

	return &model.EncounterMonster{
		Count:     row.Count,
		ID:        row.ID.String(),
		MaxHp:     row.MaxHp,
		StatBlock: r.snapshotObject(row.ID.String(), row.CustomMonsterID, row.SourceKey, &stats),
	}, nil
}

// prepRow loads a front, danger, portent, encounter, or encounter monster
// by ID with load, then checks that the logged-in user is the GM of the
// campaign campaignOf returns. A player in the campaign gets errGMOnly;
// anyone else, not found.
func prepRow[T any](ctx context.Context, r *Resolver, kind, id string, load func(pgtype.UUID) (T, error), campaignOf func(*T) (pgtype.UUID, error)) (*T, *db.Campaign, *db.User, error) {
	uuid, err := parseUUID(kind, id)
	if err != nil {
		return nil, nil, nil, err
	}

	row, err := load(uuid)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil, nil, fmt.Errorf("%s with ID '%s' %w", kind, id, errNotFound)
	}
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to load %s with ID '%s': %w", kind, id, err)
	}

	campaignID, err := campaignOf(&row)
	if err != nil {
		return nil, nil, nil, err
	}

	campaign, user, err := r.loadCampaign(ctx, campaignID, true)
	if errors.Is(err, errNotFound) {
		return nil, nil, nil, fmt.Errorf("%s with ID '%s' %w", kind, id, errNotFound)
	}
	if err != nil {
		return nil, nil, nil, err
	}

	return &row, campaign, user, nil
}

func (r *Resolver) loadFront(ctx context.Context, id string) (*db.Front, *db.Campaign, *db.User, error) {
	q := db.New(r.DbPool)
	return prepRow(ctx, r, "front", id, func(u pgtype.UUID) (db.Front, error) { return q.SelectFront(ctx, u) },
		func(f *db.Front) (pgtype.UUID, error) { return f.CampaignID, nil })
}

func (r *Resolver) loadDanger(ctx context.Context, id string) (*db.Danger, *db.Campaign, *db.User, error) {
	q := db.New(r.DbPool)
	return prepRow(ctx, r, "danger", id, func(u pgtype.UUID) (db.Danger, error) { return q.SelectDanger(ctx, u) },
		func(d *db.Danger) (pgtype.UUID, error) { return d.CampaignID, nil })
}

// loadPortent loads a grim portent with its danger.
func (r *Resolver) loadPortent(ctx context.Context, id string) (*db.GrimPortent, *db.Danger, *db.Campaign, *db.User, error) {
	q := db.New(r.DbPool)
	var danger db.Danger
	portent, campaign, user, err := prepRow(ctx, r, "grim portent", id, func(u pgtype.UUID) (db.GrimPortent, error) { return q.SelectGrimPortent(ctx, u) },
		func(p *db.GrimPortent) (pgtype.UUID, error) {
			var err error
			danger, err = q.SelectDanger(ctx, p.DangerID)
			if err != nil {
				return pgtype.UUID{}, fmt.Errorf("failed to load danger with ID '%s': %w", p.DangerID.String(), err)
			}
			return danger.CampaignID, nil
		})

	return portent, &danger, campaign, user, err
}

func (r *Resolver) loadEncounter(ctx context.Context, id string) (*db.Encounter, *db.Campaign, *db.User, error) {
	q := db.New(r.DbPool)
	return prepRow(ctx, r, "encounter", id, func(u pgtype.UUID) (db.Encounter, error) { return q.SelectEncounter(ctx, u) },
		func(e *db.Encounter) (pgtype.UUID, error) { return e.CampaignID, nil })
}

func (r *Resolver) loadEncounterMonster(ctx context.Context, id string) (*db.EncounterMonster, *db.Campaign, *db.User, error) {
	q := db.New(r.DbPool)
	return prepRow(ctx, r, "encounter monster", id, func(u pgtype.UUID) (db.EncounterMonster, error) { return q.SelectEncounterMonster(ctx, u) },
		func(m *db.EncounterMonster) (pgtype.UUID, error) {
			e, err := q.SelectEncounter(ctx, m.EncounterID)
			if err != nil {
				return pgtype.UUID{}, fmt.Errorf("failed to load encounter with ID '%s': %w", m.EncounterID.String(), err)
			}
			return e.CampaignID, nil
		})
}

// campaignRef parses an optional ID of a front or danger that must be in
// the campaign, returning NULL for nil. A wrong one is a field error.
func campaignRef(field string, id *string, campaignID pgtype.UUID, load func(pgtype.UUID) (pgtype.UUID, error)) (pgtype.UUID, error) {
	if id == nil {
		return pgtype.UUID{}, nil
	}

	notInCampaign := models.ValidationError{Field: field, Message: "Choose one from this campaign."}
	var uuid pgtype.UUID
	if err := uuid.Scan(*id); err != nil {
		return uuid, notInCampaign
	}

	owner, err := load(uuid)
	if errors.Is(err, pgx.ErrNoRows) || (err == nil && owner != campaignID) {
		return uuid, notInCampaign
	}
	if err != nil {
		return uuid, fmt.Errorf("failed to check %s: %w", field, err)
	}

	return uuid, nil
}

// frontInput converts and validates a front's input.
func frontInput(input model.FrontInput) (models.FrontInput, []byte, []models.ValidationError, error) {
	in := models.FrontInput{Kind: string(input.Kind), Name: input.Name, Notes: input.Notes, Stakes: make([]models.Stake, len(input.Stakes))}
	for i, s := range input.Stakes {
		in.Stakes[i] = models.Stake{Answer: s.Answer, Question: s.Question}
	}

	out, errs := models.ValidateFrontInput(in)
	stakes, err := json.Marshal(out.Stakes)
	if err != nil {
		return out, nil, nil, fmt.Errorf("failed to encode stakes: %w", err)
	}

	return out, stakes, errs, nil
}

// dangerInput converts and validates a danger's input, checking that its
// front is in the campaign.
func (r *Resolver) dangerInput(ctx context.Context, input model.DangerInput, campaignID pgtype.UUID) (models.DangerInput, pgtype.UUID, []models.ValidationError, error) {
	in := models.DangerInput{
		ImpendingDoom: input.ImpendingDoom,
		Impulse:       input.Impulse,
		Name:          input.Name,
		Notes:         input.Notes,
		Portents:      make([]models.PortentInput, len(input.Portents)),
		Type:          input.Type,
	}
	for i, p := range input.Portents {
		in.Portents[i] = models.PortentInput{Text: p.Text}
		if p.ID != nil {
			in.Portents[i].ID = *p.ID
		}
	}

	out, errs := models.ValidateDangerInput(in)

	q := db.New(r.DbPool)
	frontID, err := campaignRef("frontId", input.FrontID, campaignID, func(u pgtype.UUID) (pgtype.UUID, error) {
		f, err := q.SelectFront(ctx, u)
		return f.CampaignID, err
	})
	var ve models.ValidationError
	if errors.As(err, &ve) {
		errs = append(errs, ve)
	} else if err != nil {
		return out, frontID, nil, err
	}

	return out, frontID, errs, nil
}

// encounterInput converts and validates an encounter's input, checking
// that its danger is in the campaign.
func (r *Resolver) encounterInput(ctx context.Context, input model.EncounterInput, campaignID pgtype.UUID) (models.EncounterInput, pgtype.UUID, []models.ValidationError, error) {
	out, errs := models.ValidateEncounterInput(models.EncounterInput{Location: input.Location, Name: input.Name, Notes: input.Notes})

	q := db.New(r.DbPool)
	dangerID, err := campaignRef("dangerId", input.DangerID, campaignID, func(u pgtype.UUID) (pgtype.UUID, error) {
		d, err := q.SelectDanger(ctx, u)
		return d.CampaignID, err
	})
	var ve models.ValidationError
	if errors.As(err, &ve) {
		errs = append(errs, ve)
	} else if err != nil {
		return out, dangerID, nil, err
	}

	return out, dangerID, errs, nil
}

// savePortents applies an edit of a danger's portents.
func savePortents(ctx context.Context, queries *db.Queries, dangerID pgtype.UUID, input []models.PortentInput) error {
	existing, err := queries.SelectGrimPortentsByDangers(ctx, []pgtype.UUID{dangerID})
	if err != nil {
		return fmt.Errorf("failed to load grim portents: %w", err)
	}
	ids := make([]string, len(existing))
	for i, p := range existing {
		ids[i] = p.ID.String()
	}

	plan, err := models.PlanPortents(ids, input)
	if err != nil {
		return err
	}

	for _, id := range plan.Remove {
		uuid, _ := parseUUID("grim portent", id)
		if err := queries.DeleteGrimPortent(ctx, uuid); err != nil {
			return fmt.Errorf("failed to remove a grim portent: %w", err)
		}
	}
	for _, p := range plan.Keep {
		uuid, _ := parseUUID("grim portent", p.ID)
		if err := queries.UpdateGrimPortent(ctx, db.UpdateGrimPortentParams{ID: uuid, Position: int32(p.Position), Text: p.Text}); err != nil {
			return fmt.Errorf("failed to update a grim portent: %w", err)
		}
	}
	for _, p := range plan.Add {
		if err := queries.InsertGrimPortent(ctx, db.InsertGrimPortentParams{DangerID: dangerID, Position: int32(p.Position), Text: p.Text}); err != nil {
			return fmt.Errorf("failed to add a grim portent: %w", err)
		}
	}

	return nil
}

// inTransaction runs fn in a transaction, committing if it succeeds.
func (r *Resolver) inTransaction(ctx context.Context, fn func(*db.Queries) error) error {
	tx, err := r.DbPool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err := tx.Rollback(ctx); err != nil && !errors.Is(err, pgx.ErrTxClosed) {
			slog.ErrorContext(ctx, "failed to roll back", "error", err)
		}
	}()

	if err := fn(db.New(tx)); err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
