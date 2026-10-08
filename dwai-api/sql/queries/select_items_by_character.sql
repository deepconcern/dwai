-- name: SelectItemsByCharacter :many
SELECT character_id,
    count,
    description,
    id,
    is_worn,
    key,
    label,
    type
FROM items
WHERE character_id = $1::uuid;