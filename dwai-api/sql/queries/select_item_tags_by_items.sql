-- name: SelectItemTagsByItems :many
SELECT id,
    item_id,
    key,
    quantity
FROM item_tags
WHERE item_id = ANY ($1::int []);