CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    name TEXT NOT NULL
);

CREATE TABLE looks(
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    id SERIAL PRIMARY KEY,
    look_type TEXT NOT NULL,
    value TEXT NOT NULL
);