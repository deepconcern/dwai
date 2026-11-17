-- name: InsertCampaign :one
INSERT INTO campaigns (description, gm_id, invite_code, name)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: LoadCampaigns :many
SELECT *
FROM campaigns
WHERE id = ANY ($1::uuid []);

-- name: SelectCampaignByInviteCode :one
SELECT *
FROM campaigns
WHERE invite_code = $1;

-- name: SelectCampaignsByMember :many
-- Campaigns the user runs or has a character in, oldest first.
SELECT *
FROM campaigns
WHERE gm_id = sqlc.arg(user_id)
    OR id IN (
        SELECT campaign_id
        FROM characters
        WHERE owner_id = sqlc.arg(user_id)
            AND campaign_id IS NOT NULL
    )
ORDER BY id;

-- name: UpdateCampaign :one
UPDATE campaigns
SET description = $2,
    name = $3
WHERE id = $1
RETURNING *;

-- name: UpdateCampaignInviteCode :one
UPDATE campaigns
SET invite_code = $2
WHERE id = $1
RETURNING *;

-- name: DeleteCampaign :exec
DELETE FROM campaigns
WHERE id = $1;

-- name: SelectCharactersByCampaign :many
SELECT *
FROM characters
WHERE campaign_id = $1
ORDER BY id;

-- name: SelectCampaignCharacterByOwner :one
-- The user's character in a campaign, if any.
SELECT *
FROM characters
WHERE campaign_id = $1
    AND owner_id = $2;

-- name: SetCharacterCampaign :one
UPDATE characters
SET campaign_id = $2
WHERE id = $1
RETURNING *;

-- name: SelectUsersByID :many
SELECT *
FROM users
WHERE id = ANY ($1::uuid []);
