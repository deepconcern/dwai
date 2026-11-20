-- name: InsertCampaignMonster :one
INSERT INTO campaign_monsters (campaign_id, custom_monster_id, encounter_id, hp, max_hp, name, source_key, stat_block)
VALUES ($1, $2, $3, $4, $4, $5, $6, $7)
RETURNING *;

-- name: SelectCampaignMonster :one
SELECT *
FROM campaign_monsters
WHERE id = $1;

-- name: SelectCampaignMonsters :many
SELECT *
FROM campaign_monsters
WHERE campaign_id = $1
ORDER BY id;

-- name: SelectCampaignMonsterNames :many
SELECT name
FROM campaign_monsters
WHERE campaign_id = $1;

-- name: UpdateCampaignMonsterHP :one
UPDATE campaign_monsters
SET hp = $2
WHERE id = $1
RETURNING *;

-- name: UpdateCampaignMonsterName :one
UPDATE campaign_monsters
SET name = $2
WHERE id = $1
RETURNING *;

-- name: DeleteCampaignMonster :exec
DELETE FROM campaign_monsters
WHERE id = $1;
