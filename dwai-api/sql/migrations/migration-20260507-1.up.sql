CREATE TABLE characters (
    alignment_description TEXT NOT NULL,
    alignment_type TEXT NOT NULL,
    character_class_key TEXT NOT NULL,
    charisma INT NOT NULL,
    constitution INT NOT NULL,
    dexterity INT NOT NULL,
    hit_points INT NOT NULL,
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    intelligence INT NOT NULL,
    name TEXT NOT NULL,
    race_move_key TEXT NOT NULL,
    strength INT NOT NULL,
    wisdom INT NOT NULL
);
CREATE TABLE looks (
    character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    id SERIAL PRIMARY KEY,
    look_type TEXT NOT NULL,
    value TEXT NOT NULL
);
CREATE TABLE move_creation_option_choices (
    character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    choice_index INT NOT NULL,
    id SERIAL PRIMARY KEY,
    move_key TEXT NOT NULL,
    option_key TEXT NOT NULL
);