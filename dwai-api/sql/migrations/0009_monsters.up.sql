-- A GM's own monsters (their bestiary), written from scratch or copied from
-- the compendium. Only the owner sees them. The stat block is JSON in the
-- shape of models.MonsterStatBlock.
CREATE TABLE custom_monsters (
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    owner_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    -- The compendium monster it was copied from, if any.
    source_key TEXT,
    stat_block JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX custom_monsters_owner_user_id_idx ON custom_monsters (owner_user_id);

-- Monsters the GM has in play in a campaign. Each is a snapshot of a stat
-- block taken when it was added, so later edits to (or deletion of) its
-- source don't change it. Only the campaign's GM sees them.
CREATE TABLE campaign_monsters (
    campaign_id UUID NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- The custom monster it was added from, if any.
    custom_monster_id UUID REFERENCES custom_monsters (id) ON DELETE SET NULL,
    hp INTEGER NOT NULL CHECK (hp BETWEEN 0 AND max_hp),
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    max_hp INTEGER NOT NULL CHECK (max_hp > 0),
    name TEXT NOT NULL CHECK (name <> ''),
    -- The compendium monster it was added from (or its source was copied
    -- from), if any.
    source_key TEXT,
    stat_block JSONB NOT NULL
);

CREATE INDEX campaign_monsters_campaign_id_idx ON campaign_monsters (campaign_id);
