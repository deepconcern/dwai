-- name: InsertFront :one
INSERT INTO fronts (campaign_id, kind, name, notes, stakes)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: SelectFront :one
SELECT *
FROM fronts
WHERE id = $1;

-- name: SelectFrontsByCampaign :many
-- Unresolved fronts first, then by creation.
SELECT *
FROM fronts
WHERE campaign_id = $1
ORDER BY resolved_at IS NOT NULL, id;

-- name: UpdateFront :one
UPDATE fronts
SET kind = $2, name = $3, notes = $4, stakes = $5, updated_at = now()
WHERE id = $1
RETURNING *;

-- name: SetFrontResolved :one
UPDATE fronts
SET resolved_at = CASE WHEN sqlc.arg(resolved)::boolean THEN coalesce(resolved_at, now()) END, updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteFront :exec
DELETE FROM fronts
WHERE id = $1;

-- name: InsertDanger :one
INSERT INTO dangers (campaign_id, front_id, impending_doom, impulse, name, notes, type)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: SelectDanger :one
SELECT *
FROM dangers
WHERE id = $1;

-- name: SelectDangersByCampaign :many
SELECT *
FROM dangers
WHERE campaign_id = $1
ORDER BY id;

-- name: SelectRevealedDangers :many
SELECT *
FROM dangers
WHERE campaign_id = $1 AND revealed_at IS NOT NULL
ORDER BY revealed_at, id;

-- name: UpdateDanger :one
UPDATE dangers
SET front_id = $2, impending_doom = $3, impulse = $4, name = $5, notes = $6, type = $7, updated_at = now()
WHERE id = $1
RETURNING *;

-- name: SetDangerRevealed :one
UPDATE dangers
SET revealed_at = CASE WHEN sqlc.arg(revealed)::boolean THEN coalesce(revealed_at, now()) END
WHERE id = $1
RETURNING *;

-- name: DeleteDanger :exec
DELETE FROM dangers
WHERE id = $1;

-- name: InsertGrimPortent :exec
INSERT INTO grim_portents (danger_id, position, text)
VALUES ($1, $2, $3);

-- name: SelectGrimPortent :one
SELECT *
FROM grim_portents
WHERE id = $1;

-- name: SelectGrimPortentsByDangers :many
SELECT *
FROM grim_portents
WHERE danger_id = ANY (sqlc.arg(danger_ids)::uuid [])
ORDER BY danger_id, position;

-- name: UpdateGrimPortent :exec
UPDATE grim_portents
SET position = $2, text = $3
WHERE id = $1;

-- name: SetGrimPortentDone :one
UPDATE grim_portents
SET done_at = CASE WHEN sqlc.arg(done)::boolean THEN coalesce(done_at, now()) END
WHERE id = $1
RETURNING *;

-- name: SetGrimPortentRevealed :one
UPDATE grim_portents
SET revealed_at = CASE WHEN sqlc.arg(revealed)::boolean THEN coalesce(revealed_at, now()) END
WHERE id = $1
RETURNING *;

-- name: DeleteGrimPortent :exec
DELETE FROM grim_portents
WHERE id = $1;
