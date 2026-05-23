-- name: SelectLooksByCharacter :many
SELECT character_id,
    id,
    look_type,
    value
FROM looks
WHERE character_id = $1::uuid;