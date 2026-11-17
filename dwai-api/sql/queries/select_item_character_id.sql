-- name: SelectItemCharacterID :one
SELECT character_id
FROM items
WHERE id = $1;
