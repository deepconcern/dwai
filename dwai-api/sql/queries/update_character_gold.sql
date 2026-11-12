-- name: UpdateCharacterGold :one
UPDATE characters
SET gold = $2
WHERE id = $1
RETURNING *;
