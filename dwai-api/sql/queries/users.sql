-- name: InsertUser :one
INSERT INTO users (display_name, email, password_hash)
VALUES ($1, $2, $3)
RETURNING *;

-- name: SelectUserByEmail :one
SELECT *
FROM users
WHERE lower(email) = lower(sqlc.arg(email));
