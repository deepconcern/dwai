-- name: InsertMoveCreationOptionChoice :one
INSERT INTO move_creation_option_choices (
        character_id,
        choice_index,
        move_key,
        option_key
    )
VALUES ($1, $2, $3, $4)
RETURNING id;