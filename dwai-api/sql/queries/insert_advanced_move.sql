-- name: InsertAdvancedMove :one
INSERT INTO advanced_moves (character_id, move_key)
VALUES ($1, $2)
RETURNING id;
