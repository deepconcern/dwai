-- name: SelectItemsByCharacter :many
SELECT character_id,
    count,
    description,
    id,
    key,
    label
FROM items
WHERE character_id = $1::uuid;