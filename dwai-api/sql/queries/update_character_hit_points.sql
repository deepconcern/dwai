-- name: UpdateCharacterHitPoints :one
UPDATE characters
SET hit_points = $2
WHERE id = $1
RETURNING *;
