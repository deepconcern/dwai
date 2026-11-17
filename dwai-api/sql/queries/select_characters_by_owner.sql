-- name: SelectCharactersByOwner :many
SELECT *
FROM characters
WHERE owner_id = $1
ORDER BY id;
