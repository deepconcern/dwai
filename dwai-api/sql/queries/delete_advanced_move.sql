-- name: DeleteAdvancedMove :exec
DELETE FROM advanced_moves
WHERE character_id = $1
    AND move_key = $2;
