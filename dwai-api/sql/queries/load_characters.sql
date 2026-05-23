-- name: LoadCharacters :many
SELECT character_class_key,
    alignment_description,
    alignment_type,
    charisma,
    constitution,
    dexterity,
    hit_points,
    id,
    intelligence,
    name,
    race_move_key,
    strength,
    wisdom
FROM characters
WHERE id = ANY ($1::uuid []);