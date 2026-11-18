-- name: InsertBond :one
INSERT INTO bonds (campaign_id, character_id, target_character_id, text)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: SelectBond :one
SELECT *
FROM bonds
WHERE id = $1;

-- name: SelectActiveBondsByCharacter :many
SELECT *
FROM bonds
WHERE character_id = $1
    AND resolved_at IS NULL
ORDER BY id;

-- name: UpdateBondText :exec
UPDATE bonds
SET text = $2
WHERE id = $1;

-- name: ResolveBond :exec
UPDATE bonds
SET resolved_at = now()
WHERE id = $1;

-- name: DeleteBond :exec
DELETE FROM bonds
WHERE id = $1;

-- name: DeleteBondsInvolvingCharacter :exec
-- Bonds written by or about a character, when it leaves its campaign.
DELETE FROM bonds
WHERE character_id = $1
    OR target_character_id = $1;

-- name: CountBondsInvolvingCharacter :one
-- Bonds written by or about a character: what leaving its campaign deletes.
SELECT count(*)::integer
FROM bonds
WHERE character_id = $1
    OR target_character_id = $1;
