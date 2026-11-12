package graph

// Helpers shared by the resolvers. This file isn't generated.

import (
	"context"
	"errors"
	"fmt"

	"github.com/99designs/gqlgen/graphql"
	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"github.com/vikstrous/dataloadgen"
)

// parseCharacterID parses a character's GraphQL ID.
func parseCharacterID(id string) (pgtype.UUID, error) {
	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		return uuid, fmt.Errorf("invalid character ID '%s': %w", id, err)
	}

	return uuid, nil
}

// loadCharacter loads a character's row and its class.
func (r *Resolver) loadCharacter(ctx context.Context, id pgtype.UUID) (*db.Character, *models.CharacterClassModel, error) {
	character, err := models.LoadersFor(ctx).CharacterLoader.Load(ctx, id)
	if err != nil {
		if errors.Is(err, dataloadgen.ErrNotFound) {
			return nil, nil, fmt.Errorf("character with ID '%s' not found", id.String())
		}
		return nil, nil, err
	}

	class, ok := (*r.CharacterClasses)[character.CharacterClassKey]
	if !ok {
		return nil, nil, fmt.Errorf("no character class with key '%s'", character.CharacterClassKey)
	}

	return character, &class, nil
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
