-- name: SetItemWorn :one
UPDATE items
SET is_worn = $2
WHERE id = $1
RETURNING character_id, count, description, id, is_worn, key, label;