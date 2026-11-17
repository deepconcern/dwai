-- name: InsertCampaignSession :one
-- Numbers sessions from 1 within a campaign.
INSERT INTO campaign_sessions (
        campaign_id,
        learned,
        learned_reason,
        looted,
        looted_reason,
        number,
        overcame,
        overcame_reason
    )
VALUES (
        sqlc.arg(campaign_id),
        sqlc.arg(learned),
        sqlc.arg(learned_reason),
        sqlc.arg(looted),
        sqlc.arg(looted_reason),
        (
            SELECT coalesce(max(number), 0) + 1
            FROM campaign_sessions
            WHERE campaign_id = sqlc.arg(campaign_id)
        ),
        sqlc.arg(overcame),
        sqlc.arg(overcame_reason)
    )
RETURNING *;

-- name: SelectCampaignSessions :many
-- Newest first.
SELECT *
FROM campaign_sessions
WHERE campaign_id = $1
ORDER BY number DESC;

-- name: SelectLatestCampaignSession :one
SELECT *
FROM campaign_sessions
WHERE campaign_id = $1
ORDER BY number DESC
LIMIT 1;

-- name: InsertSessionReport :one
INSERT INTO session_reports (
        alignment_fulfilled,
        alignment_reason,
        bond_reason,
        character_id,
        resolved_bond_id,
        resolved_bond_text,
        session_id,
        xp_awarded
    )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: SelectSessionReports :many
SELECT *
FROM session_reports
WHERE session_id = $1
ORDER BY id;

-- name: SessionReportExists :one
SELECT EXISTS (
        SELECT 1
        FROM session_reports
        WHERE session_id = $1
            AND character_id = $2
    );

-- name: AddCharacterXp :one
UPDATE characters
SET xp = xp + $2
WHERE id = $1
RETURNING *;
