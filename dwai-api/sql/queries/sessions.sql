-- name: InsertSession :exec
INSERT INTO sessions (expires_at, token_hash, user_id)
VALUES ($1, $2, $3);

-- name: SelectSessionUser :one
-- Returns the session's expiry and its user, if the session hasn't expired.
SELECT sessions.expires_at,
    sqlc.embed(users)
FROM sessions
    JOIN users ON users.id = sessions.user_id
WHERE sessions.token_hash = $1
    AND sessions.expires_at > now();

-- name: ExtendSession :exec
UPDATE sessions
SET expires_at = $2
WHERE token_hash = $1;

-- name: DeleteSession :exec
DELETE FROM sessions
WHERE token_hash = $1;

-- name: DeleteExpiredSessions :execrows
DELETE FROM sessions
WHERE expires_at <= now();
