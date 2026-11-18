package graph

// Helpers for the table chat, rolls, and activity log. This file isn't
// generated.

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"slices"
	"strings"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vikstrous/dataloadgen"
)

// gmName is how the GM appears in the chat.
const gmName = "GM"

// messageObject converts a message row to what the viewer sees.
func (r *Resolver) messageObject(ctx context.Context, row *db.CampaignMessage, campaign *db.Campaign, viewer *db.User) (*model.Message, error) {
	object := &model.Message{
		AuthorIsGm:     row.AuthorUserID == campaign.GmID,
		Body:           row.Body,
		CreatedAt:      row.CreatedAt.Time,
		GmOnly:         row.GmOnly,
		ID:             row.ID.String(),
		Kind:           messageKind(row.Kind),
		Ooc:            row.Ooc,
		ViewerIsAuthor: row.AuthorUserID == viewer.ID,
	}

	var character *db.Character
	if row.CharacterID.Valid {
		var err error
		if character, err = optionalCharacter(ctx, row.CharacterID); err != nil {
			return nil, err
		}
	}
	if character != nil {
		id := character.ID.String()
		object.CharacterID = &id
		object.CharacterName = &character.Name
	}

	switch {
	case object.AuthorIsGm:
		object.AuthorName = gmName
	case character != nil && character.OwnerID == row.AuthorUserID:
		object.AuthorName = character.Name
	default:
		// The character has since been deleted.
		author, err := models.LoadersFor(ctx).UserLoader.Load(ctx, row.AuthorUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to load the author of message '%s': %w", object.ID, err)
		}
		object.AuthorName = author.DisplayName
	}

	if row.RecipientUserID.Valid {
		whisperTo, err := recipientName(ctx, row, campaign)
		if err != nil {
			return nil, err
		}
		object.WhisperTo = &whisperTo
	}

	if row.Roll != nil {
		roll, err := r.rollObject(row.Roll, character)
		if err != nil {
			return nil, fmt.Errorf("failed to read the roll in message '%s': %w", object.ID, err)
		}
		object.Roll = roll
	}

	return object, nil
}

// recipientName names a whisper's recipient: the GM, or a character.
func recipientName(ctx context.Context, row *db.CampaignMessage, campaign *db.Campaign) (string, error) {
	if row.RecipientUserID == campaign.GmID {
		return gmName, nil
	}

	if row.RecipientCharacterID.Valid {
		character, err := optionalCharacter(ctx, row.RecipientCharacterID)
		if err != nil {
			return "", err
		}
		if character != nil {
			return character.Name, nil
		}
	}

	user, err := models.LoadersFor(ctx).UserLoader.Load(ctx, row.RecipientUserID)
	if err != nil {
		return "", fmt.Errorf("failed to load the recipient of message '%s': %w", row.ID.String(), err)
	}

	return user.DisplayName, nil
}

// optionalCharacter loads a character, or nil if it no longer exists.
func optionalCharacter(ctx context.Context, id pgtype.UUID) (*db.Character, error) {
	character, err := models.LoadersFor(ctx).CharacterLoader.Load(ctx, id)
	if errors.Is(err, dataloadgen.ErrNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load character with ID '%s': %w", id.String(), err)
	}

	return character, nil
}

// messageKind converts a stored message kind to the GraphQL enum.
func messageKind(kind string) model.MessageKind {
	return model.MessageKind(strings.ToUpper(kind))
}

// rollObject converts a stored roll to a GraphQL object. The character, if
// known, is used to find a class move.
func (r *Resolver) rollObject(data []byte, character *db.Character) (*model.Roll, error) {
	var roll models.Roll
	if err := json.Unmarshal(data, &roll); err != nil {
		return nil, err
	}

	object := &model.Roll{
		DiceTotal: roll.DiceTotal,
		Label:     roll.Label,
		Modifiers: make([]*model.Modifier, len(roll.Modifiers)),
		Source:    model.RollSource(roll.Source),
		Total:     roll.Total,
	}
	if roll.Band != nil {
		band := model.RollBand(*roll.Band)
		object.Band = &band
	}
	if roll.Dice != nil {
		object.Dice = make([]*model.Die, len(roll.Dice))
		for i, d := range roll.Dice {
			object.Dice[i] = &model.Die{Dropped: d.Dropped, Sides: d.Sides, Value: d.Value}
		}
	}
	for i, m := range roll.Modifiers {
		object.Modifiers[i] = &model.Modifier{Label: m.Label, Value: m.Value}
	}
	if roll.MoveKey != "" {
		object.Move = r.findMove(character, roll.MoveKey)
	}

	return object, nil
}

// findMove returns a basic or special move, or one of the character's class
// moves, with the key, or nil.
func (r *Resolver) findMove(character *db.Character, key string) *model.Move {
	if move, ok := (*r.PlayerMoves)[key]; ok {
		return move.ToObject()
	}

	if character == nil {
		return nil
	}

	class, err := r.classOf(character)
	if err != nil {
		return nil
	}
	if move := class.FindMove(key); move != nil {
		return move.ToObject()
	}

	return nil
}

// insertMessage saves a message, which announces it to subscribers, and
// returns it as the author sees it.
func (r *Resolver) insertMessage(ctx context.Context, params db.InsertCampaignMessageParams, campaign *db.Campaign, author *db.User) (*model.Message, error) {
	row, err := db.New(r.DbPool).InsertCampaignMessage(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to post a message to campaign with ID '%s': %w", campaign.ID.String(), err)
	}

	return r.messageObject(ctx, &row, campaign, author)
}

// rollerCharacter returns the logged-in player's character in the campaign,
// which rolls are made for. The GM has none.
func (r *Resolver) rollerCharacter(ctx context.Context, campaign *db.Campaign, user *db.User) (*db.Character, error) {
	character, err := db.New(r.DbPool).SelectCampaignCharacterByOwner(ctx, db.SelectCampaignCharacterByOwnerParams{CampaignID: campaign.ID, OwnerID: user.ID})
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, models.ValidationError{Field: "id", Message: "Only players roll: the GM has no character in this campaign."}
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load your character in campaign with ID '%s': %w", campaign.ID.String(), err)
	}

	return &character, nil
}

// rollInput converts a roll from GraphQL input to the rules type.
func rollInput(dice []*model.DieInput, diceTotal *int32, label string, modifiers []*model.ModifierInput) models.RollInput {
	input := models.RollInput{DiceTotal: diceTotal, Label: label, Modifiers: make([]models.Modifier, len(modifiers))}
	if dice != nil {
		input.Dice = make([]models.Die, len(dice))
		for i, d := range dice {
			input.Dice[i] = models.Die{Dropped: d.Dropped, Sides: d.Sides, Value: d.Value}
		}
	}
	for i, m := range modifiers {
		input.Modifiers[i] = models.Modifier{Label: m.Label, Value: m.Value}
	}

	return input
}

// logActivity posts an activity line about a character to its campaign's
// chat, if it's in one: summary describes what the logged-in user did. The
// change has already been saved, so a failure to log is only reported.
func logActivity(ctx context.Context, pool db.DBTX, character *db.Character, actor *db.User, summary string) {
	if !character.CampaignID.Valid {
		return
	}

	_, err := db.New(pool).InsertCampaignMessage(ctx, db.InsertCampaignMessageParams{
		AuthorUserID: actor.ID,
		Body:         summary,
		CampaignID:   character.CampaignID,
		CharacterID:  character.ID,
		Kind:         models.MessageKindActivity,
	})
	if err != nil {
		slog.ErrorContext(ctx, "failed to log activity", "character", character.ID.String(), "summary", summary, "error", err)
	}
}

// logCampaignActivity posts an activity line that's about the campaign, not
// one character, such as the GM starting End of Session.
func logCampaignActivity(ctx context.Context, pool db.DBTX, campaignID pgtype.UUID, actor *db.User, summary string) {
	_, err := db.New(pool).InsertCampaignMessage(ctx, db.InsertCampaignMessageParams{
		AuthorUserID: actor.ID,
		Body:         summary,
		CampaignID:   campaignID,
		Kind:         models.MessageKindActivity,
	})
	if err != nil {
		slog.ErrorContext(ctx, "failed to log activity", "campaign", campaignID.String(), "summary", summary, "error", err)
	}
}

// signed formats a number with its sign, as in "+1" or "-2".
func signed(n int32) string {
	return fmt.Sprintf("%+d", n)
}

// maxMessagePage is the most messages one page of chat returns.
const maxMessagePage = 100

// insertRoll saves a move or damage roll by a player's character.
func (r *Resolver) insertRoll(ctx context.Context, kind string, roll models.Roll, gmOnly bool, character *db.Character, campaign *db.Campaign, user *db.User) (*model.Message, error) {
	data, err := json.Marshal(roll)
	if err != nil {
		return nil, fmt.Errorf("failed to encode a roll: %w", err)
	}

	return r.insertMessage(ctx, db.InsertCampaignMessageParams{
		AuthorUserID: user.ID,
		CampaignID:   campaign.ID,
		CharacterID:  character.ID,
		GmOnly:       gmOnly,
		Kind:         kind,
		Roll:         data,
	}, campaign, user)
}

// deliverable converts a newly posted message for a subscriber, or returns
// nil if they may not see it. Membership is checked again for each message,
// so a player who leaves stops receiving the chat. Each message gets fresh
// loaders: the connection's own would cache rows for its whole lifetime.
func (r *Resolver) deliverable(ctx context.Context, row *db.CampaignMessage, viewer *db.User) (*model.Message, error) {
	ctx = models.WithLoaders(ctx, r.DbPool)

	members, err := db.New(r.DbPool).SelectCampaignMemberUserIDs(ctx, row.CampaignID)
	if err != nil {
		return nil, fmt.Errorf("failed to load campaign members: %w", err)
	}
	if !slices.Contains(members, viewer.ID) {
		return nil, nil
	}

	campaign, err := models.LoadersFor(ctx).CampaignLoader.Load(ctx, row.CampaignID)
	if err != nil {
		return nil, fmt.Errorf("failed to load campaign with ID '%s': %w", row.CampaignID.String(), err)
	}

	if !models.CanSeeMessage(viewer.ID, campaign.GmID == viewer.ID, row) {
		return nil, nil
	}

	return r.messageObject(ctx, row, campaign, viewer)
}

// bonusText describes a bonus, as in "+1 forward: Aid from Lux".
func bonusText(bonus *db.CharacterBonus) string {
	return fmt.Sprintf("%s %s: %s", signed(bonus.Amount), bonus.Kind, bonus.Label)
}

// bondTargetName names the character a bond is about.
func bondTargetName(ctx context.Context, bond *db.Bond) string {
	target, err := optionalCharacter(ctx, bond.TargetCharacterID)
	if err != nil || target == nil {
		return "another character"
	}

	return target.Name
}

// xpText describes marking or unmarking XP.
func xpText(delta int32) string {
	if delta < 0 {
		return fmt.Sprintf("unmarked %d XP", -delta)
	}

	return fmt.Sprintf("marked %d XP", delta)
}

// damageText describes damage taken.
func damageText(d models.DamageInput, armor, before, after int32) string {
	var armorText string
	switch {
	case d.IgnoresArmor:
		armorText = "ignores armor"
	case d.Piercing > 0:
		armorText = fmt.Sprintf("armor %d, %d piercing", armor, d.Piercing)
	default:
		armorText = fmt.Sprintf("armor %d", armor)
	}

	return fmt.Sprintf("took %d damage (%s), HP %d → %d", d.Amount, armorText, before, after)
}

// debilityText describes setting or clearing a debility.
func debilityText(debility model.Debility, active bool) string {
	name := strings.ToUpper(string(debility)[:1]) + strings.ToLower(string(debility)[1:])
	if active {
		return "is now " + name
	}

	return "is no longer " + name
}

// levelUpText describes a level up.
func levelUpText(class *models.CharacterClassModel, level int32, input model.LevelUpInput) string {
	move := input.AdvancedMoveKey
	if m := class.FindMove(input.AdvancedMoveKey); m != nil {
		move = m.Name
	}
	ability := strings.ToUpper(string(input.Ability)[:1]) + strings.ToLower(string(input.Ability)[1:])

	return fmt.Sprintf("leveled up to %d: +1 %s, took %s", level, ability, move)
}

// sessionReportText describes an End of Session report. resolvedAbout names
// the resolved bond's subject, or is empty.
func sessionReportText(session, xp int32, alignment bool, resolvedAbout string) string {
	var details []string
	if alignment {
		details = append(details, "fulfilled their alignment")
	}
	if resolvedAbout != "" {
		details = append(details, "resolved a bond about "+resolvedAbout)
	}

	text := fmt.Sprintf("reported on End of Session %d: %s XP", session, signed(xp))
	if len(details) > 0 {
		text += " (" + strings.Join(details, ", ") + ")"
	}

	return text
}
