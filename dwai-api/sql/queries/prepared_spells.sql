-- name: SelectPreparedSpellsByCharacter :many
SELECT is_forgotten,
    spell_key
FROM prepared_spells
WHERE character_id = $1::uuid
ORDER BY id;
-- name: InsertPreparedSpell :exec
INSERT INTO prepared_spells (character_id, spell_key)
VALUES ($1, $2);
-- name: DeletePreparedSpell :exec
DELETE FROM prepared_spells
WHERE character_id = $1
    AND spell_key = $2;
-- name: DeletePreparedSpellsByCharacter :exec
DELETE FROM prepared_spells
WHERE character_id = $1;
-- name: SetPreparedSpellForgotten :execrows
UPDATE prepared_spells
SET is_forgotten = $3
WHERE character_id = $1
    AND spell_key = $2;
