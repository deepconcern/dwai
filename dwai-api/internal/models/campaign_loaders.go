package models

import (
	"context"
	"fmt"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
)

// campaignFetcher returns the batch function for Loaders.CampaignLoader.
func campaignFetcher(queries *db.Queries) func(context.Context, []pgtype.UUID) (map[pgtype.UUID]*db.Campaign, error) {
	return func(ctx context.Context, keys []pgtype.UUID) (map[pgtype.UUID]*db.Campaign, error) {
		rows, err := queries.LoadCampaigns(ctx, keys)
		if err != nil {
			return nil, fmt.Errorf("failed to load campaigns: %w", err)
		}

		campaigns := make(map[pgtype.UUID]*db.Campaign, len(rows))
		for i := range rows {
			campaigns[rows[i].ID] = &rows[i]
		}

		return campaigns, nil
	}
}

// userFetcher returns the batch function for Loaders.UserLoader.
func userFetcher(queries *db.Queries) func(context.Context, []pgtype.UUID) (map[pgtype.UUID]*db.User, error) {
	return func(ctx context.Context, keys []pgtype.UUID) (map[pgtype.UUID]*db.User, error) {
		rows, err := queries.SelectUsersByID(ctx, keys)
		if err != nil {
			return nil, fmt.Errorf("failed to load users: %w", err)
		}

		users := make(map[pgtype.UUID]*db.User, len(rows))
		for i := range rows {
			users[rows[i].ID] = &rows[i]
		}

		return users, nil
	}
}
