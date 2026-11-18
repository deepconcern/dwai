package graph

// Helpers shared by the resolvers. This file isn't generated.

import (
	"context"
	"errors"
	"fmt"

	"github.com/99designs/gqlgen/graphql"
	"github.com/deepconcern/dwai/dwai-api/internal/auth"
	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"github.com/vikstrous/dataloadgen"
)

// errNotFound is wrapped by errors for a character or item that doesn't
// exist or belongs to another user. Its text completes the message, as in
// "character with ID '…' not found".
var errNotFound = errors.New("not found")

// parseCharacterID parses a character's GraphQL ID.
func parseCharacterID(id string) (pgtype.UUID, error) {
	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		return uuid, fmt.Errorf("invalid character ID '%s': %w", id, err)
	}

	return uuid, nil
}

// loadCharacter loads a character's row and its class. It's the ownership
// check for every change only a character's owner may make (and so every
// item and spell resolver): it requires a logged-in user, and reports
// another user's character as not found, so IDs aren't confirmed to exist.
// Reads use loadViewableCharacter, which also lets the campaign's GM in.
func (r *Resolver) loadCharacter(ctx context.Context, id pgtype.UUID) (*db.Character, *models.CharacterClassModel, error) {
	user, err := auth.RequireUser(ctx)
	if err != nil {
		return nil, nil, err
	}

	character, err := models.LoadersFor(ctx).CharacterLoader.Load(ctx, id)
	if errors.Is(err, dataloadgen.ErrNotFound) || (err == nil && character.OwnerID != user.ID) {
		return nil, nil, fmt.Errorf("character with ID '%s' %w", id.String(), errNotFound)
	}
	if err != nil {
		return nil, nil, err
	}

	class, err := r.classOf(character)
	if err != nil {
		return nil, nil, err
	}

	return character, class, nil
}

// classOf returns a character's class.
func (r *Resolver) classOf(character *db.Character) (*models.CharacterClassModel, error) {
	class, ok := (*r.CharacterClasses)[character.CharacterClassKey]
	if !ok {
		return nil, fmt.Errorf("no character class with key '%s'", character.CharacterClassKey)
	}

	return &class, nil
}

// loadItemCharacter loads the character that owns an item, checking that it
// belongs to the logged-in user (see loadCharacter). An item on another
// user's character is reported as not found.
func (r *Resolver) loadItemCharacter(ctx context.Context, itemID int32) (*db.Character, error) {
	if _, err := auth.RequireUser(ctx); err != nil {
		return nil, err
	}

	characterID, err := db.New(r.DbPool).SelectItemCharacterID(ctx, itemID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("item with ID '%d' %w", itemID, errNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load item with ID '%d': %w", itemID, err)
	}

	character, _, err := r.loadCharacter(ctx, characterID)
	if errors.Is(err, errNotFound) {
		return nil, fmt.Errorf("item with ID '%d' %w", itemID, errNotFound)
	}
	if err != nil {
		return nil, err
	}

	return character, nil
}

// userObject converts a user row to a GraphQL object.
func userObject(user *db.User) *model.User {
	return &model.User{
		DisplayName: user.DisplayName,
		Email:       user.Email,
		ID:          user.ID.String(),
	}
}

// characterUpdated replaces the request's cached row for a character with
// the row an update returned, and returns it as a GraphQL object, so fields
// resolved afterwards see the new values.
func characterUpdated(ctx context.Context, row db.Character) *model.Character {
	loader := models.LoadersFor(ctx).CharacterLoader
	loader.Clear(row.ID)
	loader.Prime(row.ID, &row)

	return models.ToCharacterObject(&row)
}

// characterItems loads a character's items, resolved against their
// templates.
func (r *Resolver) characterItems(ctx context.Context, id pgtype.UUID) ([]*model.Item, error) {
	queries := db.New(r.DbPool)

	itemRows, err := queries.SelectItemsByCharacter(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to load items for character with ID '%s': %w", id.String(), err)
	}

	itemIds := make([]int32, len(itemRows))
	for i, row := range itemRows {
		itemIds[i] = row.ID
	}

	tagRows, err := queries.SelectItemTagsByItems(ctx, itemIds)
	if err != nil {
		return nil, fmt.Errorf("failed to load item tags for character with ID '%s': %w", id.String(), err)
	}

	tagsByItemId := make(map[int32][]*db.ItemTag, len(itemRows))
	for i := range tagRows {
		tagsByItemId[tagRows[i].ItemID] = append(tagsByItemId[tagRows[i].ItemID], &tagRows[i])
	}

	items := make([]*model.Item, len(itemRows))
	for i := range itemRows {
		items[i] = models.ToItemObject(&itemRows[i], tagsByItemId[itemRows[i].ID], r.ItemTemplates, r.TagDefinitions)
	}

	return items, nil
}

// errInvalidCredentials is the one error for a failed login, whether the
// email or the password was wrong.
func errInvalidCredentials(ctx context.Context) error {
	return validationError(ctx, models.ValidationError{Message: "Invalid email or password"})
}

// validationError converts a rules error into a GraphQL error with the
// validation code and field, so the client can show its message as-is.
// Other errors pass through unchanged.
func validationError(ctx context.Context, err error) error {
	var ve models.ValidationError
	if !errors.As(err, &ve) {
		return err
	}

	return &gqlerror.Error{
		Message: ve.Message,
		Path:    graphql.GetPath(ctx),
		Extensions: map[string]any{
			"code":  models.ValidationErrorCode,
			"field": ve.Field,
		},
	}
}

// addValidationErrors reports each validation error separately, so the
// client can show them all at once. It returns whether there were any.
func addValidationErrors(ctx context.Context, errs []models.ValidationError) bool {
	for _, ve := range errs {
		graphql.AddError(ctx, validationError(ctx, ve))
	}

	return len(errs) > 0
}

// moveObjects converts class moves to GraphQL objects.
func moveObjects(moves []*models.ClassMoveModel) []*model.Move {
	objects := make([]*model.Move, len(moves))
	for i, m := range moves {
		objects[i] = m.ToObject()
	}

	return objects
}

// spellObjects converts spells to GraphQL objects.
func spellObjects(spells []*models.SpellModel) []*model.Spell {
	objects := make([]*model.Spell, len(spells))
	for i, s := range spells {
		objects[i] = s.ToObject()
	}

	return objects
}

// preparedSpells loads a character's prepared spells, as GraphQL objects and
// as spell models.
func (r *Resolver) preparedSpells(ctx context.Context, character *db.Character) ([]*model.PreparedSpell, []*models.SpellModel, error) {
	rows, err := db.New(r.DbPool).SelectPreparedSpellsByCharacter(ctx, character.ID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to load prepared spells for character with ID '%s': %w", character.ID.String(), err)
	}

	prepared := make([]*model.PreparedSpell, 0, len(rows))
	spells := make([]*models.SpellModel, 0, len(rows))
	for _, row := range rows {
		spell := r.Spells.Find(character.CharacterClassKey, row.SpellKey)
		if spell == nil {
			continue
		}
		prepared = append(prepared, &model.PreparedSpell{IsForgotten: row.IsForgotten, Spell: spell.ToObject()})
		spells = append(spells, spell)
	}

	return prepared, spells, nil
}
