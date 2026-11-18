-- name: InsertCampaignMessage :one
-- The insert trigger announces the message on the campaign_messages channel.
INSERT INTO campaign_messages (
        author_user_id,
        body,
        campaign_id,
        character_id,
        gm_only,
        kind,
        ooc,
        recipient_character_id,
        recipient_user_id,
        roll
    )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING *;

-- name: SelectCampaignMessage :one
SELECT *
FROM campaign_messages
WHERE id = $1;

-- name: SelectVisibleCampaignMessages :many
-- A page of the messages a viewer may see, newest first: the GM sees
-- everything; a player sees what isn't a whisper or GM-only, plus their own
-- messages and whispers to them. Must match models.CanSeeMessage.
SELECT *
FROM campaign_messages
WHERE campaign_id = sqlc.arg(campaign_id)
    AND (
        sqlc.narg(before)::uuid IS NULL
        OR id < sqlc.narg(before)::uuid
    )
    AND (
        sqlc.arg(viewer_is_gm)::boolean
        OR author_user_id = sqlc.arg(viewer_id)
        OR recipient_user_id = sqlc.arg(viewer_id)
        OR (
            recipient_user_id IS NULL
            AND NOT gm_only
        )
    )
ORDER BY id DESC
LIMIT sqlc.arg(row_limit);

-- name: SelectCampaignMemberUserIDs :many
-- The users who may read a campaign's chat: its GM and its players.
SELECT gm_id AS user_id
FROM campaigns
WHERE campaigns.id = sqlc.arg(campaign_id)
UNION
SELECT owner_id AS user_id
FROM characters
WHERE campaign_id = sqlc.arg(campaign_id);
