-- name: SelectSpellbookByCharacter :many
SELECT spell_key
FROM spellbook_spells
WHERE character_id = $1::uuid
ORDER BY id;
-- name: InsertSpellbookSpell :exec
INSERT INTO spellbook_spells (character_id, spell_key)
VALUES ($1, $2);
-- name: DeleteSpellbookSpell :execrows
DELETE FROM spellbook_spells
WHERE character_id = $1
    AND spell_key = $2;
