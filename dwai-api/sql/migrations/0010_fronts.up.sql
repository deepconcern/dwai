-- The GM's prep for a campaign: fronts, their dangers and grim portents,
-- and encounters (planned groups of monsters). Only the campaign's GM sees
-- them, except the dangers and portents the GM reveals.

-- A campaign or adventure front. Stakes questions are JSON in the shape of
-- []models.Stake, replaced whenever the front is edited.
CREATE TABLE fronts (
    campaign_id UUID NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    kind TEXT NOT NULL CHECK (kind IN ('ADVENTURE', 'CAMPAIGN')),
    name TEXT NOT NULL CHECK (name <> ''),
    notes TEXT NOT NULL DEFAULT '',
    resolved_at TIMESTAMPTZ,
    stakes JSONB NOT NULL DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX fronts_campaign_id_idx ON fronts (campaign_id);

-- A danger, in one of its campaign's fronts or in none. Type, impulse, and
-- impending doom are free text (the template only suggests them).
CREATE TABLE dangers (
    campaign_id UUID NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    front_id UUID REFERENCES fronts (id) ON DELETE CASCADE,
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    impending_doom TEXT NOT NULL DEFAULT '',
    impulse TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL CHECK (name <> ''),
    notes TEXT NOT NULL DEFAULT '',
    -- When the GM revealed it to the players; NULL while hidden.
    revealed_at TIMESTAMPTZ,
    type TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX dangers_campaign_id_idx ON dangers (campaign_id);
CREATE INDEX dangers_front_id_idx ON dangers (front_id);

-- One step of a danger's advance toward its impending doom.
CREATE TABLE grim_portents (
    danger_id UUID NOT NULL REFERENCES dangers (id) ON DELETE CASCADE,
    -- When the GM checked it off; NULL while it hasn't come to pass.
    done_at TIMESTAMPTZ,
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    position INTEGER NOT NULL,
    -- When the GM revealed it to the players; NULL while hidden.
    revealed_at TIMESTAMPTZ,
    text TEXT NOT NULL CHECK (text <> '')
);

CREATE INDEX grim_portents_danger_id_idx ON grim_portents (danger_id);

-- A planned group of monsters, linked to a danger or not.
CREATE TABLE encounters (
    campaign_id UUID NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    danger_id UUID REFERENCES dangers (id) ON DELETE SET NULL,
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    location TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL CHECK (name <> ''),
    notes TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX encounters_campaign_id_idx ON encounters (campaign_id);

-- A monster in an encounter, with how many to put into play. Like a
-- monster in play, it's a snapshot of a stat block (models.MonsterStatBlock).
CREATE TABLE encounter_monsters (
    count INTEGER NOT NULL CHECK (count BETWEEN 1 AND 20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    custom_monster_id UUID REFERENCES custom_monsters (id) ON DELETE SET NULL,
    encounter_id UUID NOT NULL REFERENCES encounters (id) ON DELETE CASCADE,
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    max_hp INTEGER NOT NULL CHECK (max_hp > 0),
    source_key TEXT,
    stat_block JSONB NOT NULL
);

CREATE INDEX encounter_monsters_encounter_id_idx ON encounter_monsters (encounter_id);

-- The encounter a monster in play was put into play from, if any.
ALTER TABLE campaign_monsters
ADD COLUMN encounter_id UUID REFERENCES encounters (id) ON DELETE SET NULL;
