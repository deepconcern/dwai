-- name: InsertItem :one
INSERT INTO items (character_id, count, description, key, label)
VALUES ($1, $2, $3, $4, $5)
RETURNING id;