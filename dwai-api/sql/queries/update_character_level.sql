-- name: UpdateCharacterLevel :one
UPDATE characters
SET charisma = $2,
    constitution = $3,
    dexterity = $4,
    hit_points = $5,
    intelligence = $6,
    level = $7,
    strength = $8,
    wisdom = $9,
    xp = $10
WHERE id = $1
RETURNING *;
