CREATE TABLE characters (
    charisma INT NOT NULL,
    constitution INT NOT NULL,
    dexterity INT NOT NULL,
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    intelligence INT NOT NULL,
    name TEXT NOT NULL,
    strength INT NOT NULL,
    wisdom INT NOT NULL
);

CREATE TABLE looks(
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    id SERIAL PRIMARY KEY,
    look_type TEXT NOT NULL,
    value TEXT NOT NULL
);