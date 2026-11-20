-- name: InsertCustomMonster :one
INSERT INTO custom_monsters (owner_user_id, source_key, stat_block)
VALUES ($1, $2, $3)
RETURNING *;

-- name: SelectCustomMonster :one
SELECT *
FROM custom_monsters
WHERE id = $1;

-- name: SelectCustomMonstersByOwner :many
SELECT *
FROM custom_monsters
WHERE owner_user_id = $1
ORDER BY stat_block ->> 'name', id;

-- name: UpdateCustomMonster :one
UPDATE custom_monsters
SET source_key = $2, stat_block = $3, updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteCustomMonster :exec
DELETE FROM custom_monsters
WHERE id = $1;
