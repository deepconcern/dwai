ALTER TABLE characters
ADD COLUMN level INT NOT NULL DEFAULT 1,
ADD COLUMN xp INT NOT NULL DEFAULT 0;
CREATE TABLE advanced_moves (
    character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    id SERIAL PRIMARY KEY,
    move_key TEXT NOT NULL,
    UNIQUE (character_id, move_key)
);
