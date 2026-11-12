-- name: LoadCharacters :many
SELECT *
FROM characters
WHERE id = ANY ($1::uuid []);
