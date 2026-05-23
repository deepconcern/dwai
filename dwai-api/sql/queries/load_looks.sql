-- name: LoadLooks :many
SELECT character_id,
    id,
    look_type,
    value
FROM looks
WHERE id = ANY ($1::int []);