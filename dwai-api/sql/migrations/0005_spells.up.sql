CREATE TABLE prepared_spells (
    character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    id SERIAL PRIMARY KEY,
    is_forgotten BOOLEAN NOT NULL DEFAULT false,
    spell_key TEXT NOT NULL,
    UNIQUE (character_id, spell_key)
);
CREATE TABLE spellbook_spells (
    character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    id SERIAL PRIMARY KEY,
    spell_key TEXT NOT NULL,
    UNIQUE (character_id, spell_key)
);
