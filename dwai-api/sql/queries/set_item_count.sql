-- name: SetItemCount :one
UPDATE items
SET count = $2
WHERE id = $1
RETURNING character_id, count, description, id, is_worn, key, label, type;
