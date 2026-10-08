-- name: InsertItem :one
INSERT INTO items (character_id, count, description, key, label, type)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;