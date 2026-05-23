-- name: LoadMoveCreationOptionChoice :many
SELECT character_id,
    choice_index,
    id,
    move_key,
    option_key
FROM move_creation_option_choices
WHERE id = ANY ($1::int []);