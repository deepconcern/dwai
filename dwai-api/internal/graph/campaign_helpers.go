package graph

// Helpers for campaigns, bonds, and End of Session. This file isn't
// generated.

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"slices"

	"github.com/deepconcern/dwai/dwai-api/internal/auth"
	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vikstrous/dataloadgen"
)

// errGMOnly is returned when a campaign member who isn't its GM calls a
// GM-only mutation.
var errGMOnly = errors.New("only the campaign's GM can do that")

// parseUUID parses a GraphQL ID; kind names the entity for the error.
func parseUUID(kind, id string) (pgtype.UUID, error) {
	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		return uuid, fmt.Errorf("invalid %s ID '%s': %w", kind, id, err)
	}

	return uuid, nil
}

// optionalText converts a string to a nullable column, with "" as NULL.
func optionalText(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: s != ""}
}

// textPtr converts a nullable column to a nullable GraphQL string.
func textPtr(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}

	return &t.String
}

// isGMOf reports whether a character is in a campaign the user runs.
func isGMOf(ctx context.Context, user *db.User, character *db.Character) (bool, error) {
	if !character.CampaignID.Valid {
		return false, nil
	}

	campaign, err := models.LoadersFor(ctx).CampaignLoader.Load(ctx, character.CampaignID)
	if errors.Is(err, dataloadgen.ErrNotFound) {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	return campaign.GmID == user.ID, nil
}

// loadViewableCharacter is loadCharacter, but also lets the GM of the
// character's campaign through. It's the check for reading a sheet, and for
// the HP and XP changes a GM may make.
func (r *Resolver) loadViewableCharacter(ctx context.Context, id pgtype.UUID) (*db.Character, *models.CharacterClassModel, error) {
	user, err := auth.RequireUser(ctx)
	if err != nil {
		return nil, nil, err
	}

	character, err := models.LoadersFor(ctx).CharacterLoader.Load(ctx, id)
	if errors.Is(err, dataloadgen.ErrNotFound) {
		return nil, nil, fmt.Errorf("character with ID '%s' %w", id.String(), errNotFound)
	}
	if err != nil {
		return nil, nil, err
	}

	if character.OwnerID != user.ID {
		gm, err := isGMOf(ctx, user, character)
		if err != nil {
			return nil, nil, err
		}
		if !gm {
			return nil, nil, fmt.Errorf("character with ID '%s' %w", id.String(), errNotFound)
		}
	}

	class, err := r.classOf(character)
	if err != nil {
		return nil, nil, err
	}

	return character, class, nil
}

// loadCampaign loads a campaign the logged-in user runs or plays in. Any
// other campaign is reported as not found. With gmOnly, a player gets
// errGMOnly.
func (r *Resolver) loadCampaign(ctx context.Context, id pgtype.UUID, gmOnly bool) (*db.Campaign, *db.User, error) {
	user, err := auth.RequireUser(ctx)
	if err != nil {
		return nil, nil, err
	}

	notFound := fmt.Errorf("campaign with ID '%s' %w", id.String(), errNotFound)

	campaign, err := models.LoadersFor(ctx).CampaignLoader.Load(ctx, id)
	if errors.Is(err, dataloadgen.ErrNotFound) {
		return nil, nil, notFound
	}
	if err != nil {
		return nil, nil, err
	}

	if campaign.GmID == user.ID {
		return campaign, user, nil
	}

	_, err = db.New(r.DbPool).SelectCampaignCharacterByOwner(ctx, db.SelectCampaignCharacterByOwnerParams{CampaignID: id, OwnerID: user.ID})
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil, notFound
	}
	if err != nil {
		return nil, nil, fmt.Errorf("failed to check membership of campaign with ID '%s': %w", id.String(), err)
	}

	if gmOnly {
		return nil, nil, errGMOnly
	}

	return campaign, user, nil
}

// campaignObject converts a campaign row to a GraphQL object for the given
// viewer. Only the GM sees the invite code.
func campaignObject(campaign *db.Campaign, viewer *db.User) *model.Campaign {
	object := &model.Campaign{
		Description: campaign.Description,
		ID:          campaign.ID.String(),
		IsGm:        campaign.GmID == viewer.ID,
		Name:        campaign.Name,
	}
	if object.IsGm {
		object.InviteCode = &campaign.InviteCode
	}

	return object
}

// campaignUpdated replaces the request's cached row for a campaign with the
// row an update returned, and returns it as a GraphQL object.
func campaignUpdated(ctx context.Context, row db.Campaign, viewer *db.User) *model.Campaign {
	loader := models.LoadersFor(ctx).CampaignLoader
	loader.Clear(row.ID)
	loader.Prime(row.ID, &row)

	return campaignObject(&row, viewer)
}

// loadUser loads a user by ID as a GraphQL object.
func loadUser(ctx context.Context, id pgtype.UUID) (*model.User, error) {
	user, err := models.LoadersFor(ctx).UserLoader.Load(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to load user with ID '%s': %w", id.String(), err)
	}

	return userObject(user), nil
}

// partyMember builds what every campaign member sees of a character.
func (r *Resolver) partyMember(ctx context.Context, character *db.Character) (*model.PartyMember, error) {
	class, ok := (*r.CharacterClasses)[character.CharacterClassKey]
	if !ok {
		return nil, fmt.Errorf("no character class with key '%s'", character.CharacterClassKey)
	}

	raceIndex := slices.IndexFunc(class.RaceMoves, func(m *models.ClassMoveModel) bool { return m.Key == character.RaceMoveKey })
	if raceIndex == -1 {
		return nil, fmt.Errorf("no race move with key '%s'", character.RaceMoveKey)
	}

	lookRows, err := db.New(r.DbPool).SelectLooksByCharacter(ctx, character.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to load looks for character with ID '%s': %w", character.ID.String(), err)
	}
	looks := make([]*model.Look, len(lookRows))
	for i := range lookRows {
		looks[i] = models.ToLookObject(&lookRows[i])
	}

	owner, err := loadUser(ctx, character.OwnerID)
	if err != nil {
		return nil, err
	}

	return &model.PartyMember{
		AlignmentType:  character.AlignmentType,
		CharacterClass: class.ToObject(),
		HitPoints:      character.HitPoints,
		ID:             character.ID.String(),
		Looks:          looks,
		MaxHitPoints:   models.MaxHitPoints(&class, character.Constitution),
		Name:           character.Name,
		Owner:          owner,
		RaceMove:       class.RaceMoves[raceIndex].ToObject(),
	}, nil
}

// partyMemberByID loads a character by ID, without an ownership check, and
// builds its party summary.
func (r *Resolver) partyMemberByID(ctx context.Context, id pgtype.UUID) (*model.PartyMember, error) {
	character, err := models.LoadersFor(ctx).CharacterLoader.Load(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to load character with ID '%s': %w", id.String(), err)
	}

	return r.partyMember(ctx, character)
}

// checkedAnswer converts an End of Session checkbox and its reason.
func checkedAnswer(checked bool, reason pgtype.Text) *model.CheckedAnswer {
	return &model.CheckedAnswer{Checked: checked, Reason: textPtr(reason)}
}

// checkedInput converts an End of Session checkbox from GraphQL input.
func checkedInput(input *model.CheckedInput) models.Checked {
	if input == nil {
		return models.Checked{}
	}

	checked := models.Checked{Checked: input.Checked}
	if input.Reason != nil {
		checked.Reason = *input.Reason
	}

	return checked
}

// sessionObject converts a session row to a GraphQL object.
func sessionObject(row *db.CampaignSession) *model.CampaignSession {
	return &model.CampaignSession{
		CreatedAt: row.CreatedAt.Time,
		ID:        row.ID.String(),
		Learned:   checkedAnswer(row.Learned, row.LearnedReason),
		Looted:    checkedAnswer(row.Looted, row.LootedReason),
		Number:    row.Number,
		Overcame:  checkedAnswer(row.Overcame, row.OvercameReason),
	}
}

// groupAnswers converts a session row's answers to the rules type.
func groupAnswers(row *db.CampaignSession) models.GroupAnswers {
	return models.GroupAnswers{
		Learned:  models.Checked{Checked: row.Learned},
		Looted:   models.Checked{Checked: row.Looted},
		Overcame: models.Checked{Checked: row.Overcame},
	}
}

// bondTarget checks a bond's target: another character in the author's
// campaign. Problems are validation errors on field.
func bondTarget(ctx context.Context, author *db.Character, targetID, field string) (*db.Character, error) {
	invalid := models.ValidationError{Field: field, Message: "Choose another character in your campaign."}

	uuid, err := parseUUID("character", targetID)
	if err != nil {
		return nil, invalid
	}

	target, err := models.LoadersFor(ctx).CharacterLoader.Load(ctx, uuid)
	if errors.Is(err, dataloadgen.ErrNotFound) {
		return nil, invalid
	}
	if err != nil {
		return nil, err
	}

	if target.ID == author.ID || !target.CampaignID.Valid || target.CampaignID != author.CampaignID {
		return nil, invalid
	}

	return target, nil
}

// requireCampaign returns a validation error when a character isn't in a
// campaign.
func requireCampaign(character *db.Character) error {
	if !character.CampaignID.Valid {
		return models.ValidationError{Field: "id", Message: "The character isn't in a campaign."}
	}

	return nil
}

// loadOwnBond loads a bond on one of the logged-in user's characters. A bond
// on anyone else's character is reported as not found.
func (r *Resolver) loadOwnBond(ctx context.Context, bondID string) (*db.Bond, *db.Character, error) {
	if _, err := auth.RequireUser(ctx); err != nil {
		return nil, nil, err
	}

	uuid, err := parseUUID("bond", bondID)
	if err != nil {
		return nil, nil, err
	}

	notFound := fmt.Errorf("bond with ID '%s' %w", bondID, errNotFound)

	bond, err := db.New(r.DbPool).SelectBond(ctx, uuid)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil, notFound
	}
	if err != nil {
		return nil, nil, fmt.Errorf("failed to load bond with ID '%s': %w", bondID, err)
	}

	character, _, err := r.loadCharacter(ctx, bond.CharacterID)
	if errors.Is(err, errNotFound) {
		return nil, nil, notFound
	}
	if err != nil {
		return nil, nil, err
	}

	return &bond, character, nil
}

// detachCharacter takes a character out of its campaign, deleting bonds
// written by or about it.
func (r *Resolver) detachCharacter(ctx context.Context, id pgtype.UUID) (db.Character, error) {
	tx, err := r.DbPool.Begin(ctx)
	if err != nil {
		return db.Character{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err := tx.Rollback(ctx); err != nil && !errors.Is(err, pgx.ErrTxClosed) {
			slog.ErrorContext(ctx, "failed to roll back leaving a campaign", "error", err)
		}
	}()

	queries := db.New(tx)
	if err := queries.DeleteBondsInvolvingCharacter(ctx, id); err != nil {
		return db.Character{}, fmt.Errorf("failed to delete bonds for character with ID '%s': %w", id.String(), err)
	}

	row, err := queries.SetCharacterCampaign(ctx, db.SetCharacterCampaignParams{ID: id})
	if err != nil {
		return db.Character{}, fmt.Errorf("failed to detach character with ID '%s': %w", id.String(), err)
	}

	if err := tx.Commit(ctx); err != nil {
		return db.Character{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return row, nil
}

// mustParseOptionalUUID parses an ID, returning the zero (invalid) UUID when
// it's malformed, so lookups by it find nothing.
func mustParseOptionalUUID(id string) pgtype.UUID {
	uuid, _ := parseUUID("", id)

	return uuid
}

// pendingSession returns the campaign's latest End of Session if the
// character hasn't reported on it, or nil. Reports close when the next End
// of Session starts.
func (r *Resolver) pendingSession(ctx context.Context, character *db.Character) (*db.CampaignSession, error) {
	if !character.CampaignID.Valid {
		return nil, nil
	}

	queries := db.New(r.DbPool)

	session, err := queries.SelectLatestCampaignSession(ctx, character.CampaignID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load the latest session: %w", err)
	}

	reported, err := queries.SessionReportExists(ctx, db.SessionReportExistsParams{CharacterID: character.ID, SessionID: session.ID})
	if err != nil {
		return nil, fmt.Errorf("failed to check for a session report: %w", err)
	}
	if reported {
		return nil, nil
	}

	return &session, nil
}
