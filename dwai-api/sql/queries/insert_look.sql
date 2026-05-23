-- name: InsertLook :one
INSERT INTO looks (character_id, look_type, value)
VALUES ($1, $2, $3)
RETURNING id;