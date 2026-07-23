-- name: InsertItemTag :one
INSERT INTO item_tags (item_id, key, quantity)
VALUES ($1, $2, $3)
RETURNING id;