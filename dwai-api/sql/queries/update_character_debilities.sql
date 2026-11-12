-- name: UpdateCharacterDebilities :one
UPDATE characters
SET debilities = $2
WHERE id = $1
RETURNING *;
