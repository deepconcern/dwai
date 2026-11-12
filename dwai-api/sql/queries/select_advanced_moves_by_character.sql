-- name: SelectAdvancedMovesByCharacter :many
SELECT move_key
FROM advanced_moves
WHERE character_id = $1::uuid
ORDER BY id;
