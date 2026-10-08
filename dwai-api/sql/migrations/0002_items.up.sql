CREATE TABLE items (
    character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    count INT NOT NULL DEFAULT 1,
    description TEXT,
    id SERIAL PRIMARY KEY,
    is_worn BOOLEAN NOT NULL DEFAULT false,
    key TEXT NOT NULL DEFAULT 'custom',
    label TEXT,
    type TEXT
);
CREATE TABLE item_tags (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL REFERENCES items (id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    quantity INT
);
