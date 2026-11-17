-- A campaign: a GM, the players' characters, their bonds, and the sessions
-- they've played.
CREATE TABLE campaigns (
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    description TEXT NOT NULL DEFAULT '',
    gm_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    -- Shared as a /join/<code> link. Regenerating it revokes the old one.
    invite_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE INDEX campaigns_gm_id_idx ON campaigns (gm_id);

-- A character is in at most one campaign. Deleting the campaign detaches it.
ALTER TABLE characters
ADD COLUMN campaign_id UUID REFERENCES campaigns (id) ON DELETE SET NULL;

-- A player brings one character per campaign.
CREATE UNIQUE INDEX characters_campaign_id_owner_id_key ON characters (campaign_id, owner_id)
WHERE
    campaign_id IS NOT NULL;

-- A bond written by one character about another in the same campaign. A
-- resolved bond is kept for history but is no longer active.
CREATE TABLE bonds (
    campaign_id UUID NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    resolved_at TIMESTAMPTZ,
    target_character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    CHECK (character_id <> target_character_id)
);

CREATE INDEX bonds_character_id_idx ON bonds (character_id);

CREATE INDEX bonds_target_character_id_idx ON bonds (target_character_id);

-- One End of Session: the GM's answers to the three group questions. A "yes"
-- needs a reason.
CREATE TABLE campaign_sessions (
    campaign_id UUID NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    learned BOOLEAN NOT NULL,
    learned_reason TEXT,
    looted BOOLEAN NOT NULL,
    looted_reason TEXT,
    number INTEGER NOT NULL,
    overcame BOOLEAN NOT NULL,
    overcame_reason TEXT,
    UNIQUE (campaign_id, number),
    CHECK (NOT learned OR learned_reason <> ''),
    CHECK (NOT looted OR looted_reason <> ''),
    CHECK (NOT overcame OR overcame_reason <> '')
);

-- A player's End of Session report for one character. The resolved bond's
-- text is copied so the log survives the bond being deleted.
CREATE TABLE session_reports (
    alignment_fulfilled BOOLEAN NOT NULL,
    alignment_reason TEXT,
    bond_reason TEXT,
    character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    resolved_bond_id UUID REFERENCES bonds (id) ON DELETE SET NULL,
    resolved_bond_text TEXT,
    session_id UUID NOT NULL REFERENCES campaign_sessions (id) ON DELETE CASCADE,
    xp_awarded INTEGER NOT NULL,
    UNIQUE (session_id, character_id),
    CHECK (NOT alignment_fulfilled OR alignment_reason <> ''),
    CHECK (resolved_bond_text IS NULL OR bond_reason <> '')
);
