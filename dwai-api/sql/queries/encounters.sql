-- name: InsertEncounter :one
INSERT INTO encounters (campaign_id, danger_id, location, name, notes)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: SelectEncounter :one
SELECT *
FROM encounters
WHERE id = $1;

-- name: SelectEncountersByCampaign :many
SELECT *
FROM encounters
WHERE campaign_id = $1
ORDER BY id;

-- name: UpdateEncounter :one
UPDATE encounters
SET danger_id = $2, location = $3, name = $4, notes = $5, updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteEncounter :exec
DELETE FROM encounters
WHERE id = $1;

-- name: InsertEncounterMonster :one
INSERT INTO encounter_monsters (count, custom_monster_id, encounter_id, max_hp, source_key, stat_block)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: SelectEncounterMonster :one
SELECT *
FROM encounter_monsters
WHERE id = $1;

-- name: SelectEncounterMonstersByEncounters :many
SELECT *
FROM encounter_monsters
WHERE encounter_id = ANY (sqlc.arg(encounter_ids)::uuid [])
ORDER BY encounter_id, id;

-- name: SetEncounterMonsterCount :one
UPDATE encounter_monsters
SET count = $2
WHERE id = $1
RETURNING *;

-- name: DeleteEncounterMonster :exec
DELETE FROM encounter_monsters
WHERE id = $1;
