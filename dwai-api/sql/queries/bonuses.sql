-- name: InsertBonus :one
INSERT INTO character_bonuses (amount, character_id, kind, label)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: SelectBonus :one
SELECT *
FROM character_bonuses
WHERE id = $1;

-- name: SelectBonusesByCharacter :many
SELECT *
FROM character_bonuses
WHERE character_id = $1
ORDER BY id;

-- name: DeleteBonus :exec
DELETE FROM character_bonuses
WHERE id = $1;
