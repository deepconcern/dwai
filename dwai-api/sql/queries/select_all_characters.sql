-- name: SelectAllCharacters :many
SELECT alignment_description,
    alignment_type,
    character_class_key,
    charisma,
    constitution,
    dexterity,
    gold,
    hit_points,
    id,
    intelligence,
    name,
    race_move_key,
    strength,
    wisdom
FROM characters;