-- name: UpdateCharacterXp :one
UPDATE characters
SET xp = $2
WHERE id = $1
RETURNING *;
