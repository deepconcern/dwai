-- name: DeleteItem :one
DELETE FROM items
WHERE id = $1
RETURNING character_id;
