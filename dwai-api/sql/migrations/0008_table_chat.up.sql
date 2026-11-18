-- Bonuses a character can add to rolls: +N forward (the next roll it
-- applies to) or +N ongoing (until the player removes it). The player
-- chooses which apply to each roll; nothing is removed automatically.
CREATE TABLE character_bonuses (
    amount INTEGER NOT NULL,
    character_id UUID NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    kind TEXT NOT NULL CHECK (kind IN ('forward', 'ongoing')),
    label TEXT NOT NULL CHECK (label <> '')
);

CREATE INDEX character_bonuses_character_id_idx ON character_bonuses (character_id);

-- The campaign's table chat: messages, rolls, damage rolls, and activity
-- lines (sheet changes). IDs are time-ordered, so they double as the paging
-- cursor.
CREATE TABLE campaign_messages (
    author_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    body TEXT NOT NULL DEFAULT '',
    campaign_id UUID NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
    -- The author's character (chat and rolls), or the character an activity
    -- line is about. NULL for the GM's own messages.
    character_id UUID REFERENCES characters (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Only the author and the GM see it.
    gm_only BOOLEAN NOT NULL DEFAULT false,
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    kind TEXT NOT NULL CHECK (kind IN ('activity', 'chat', 'damage', 'roll')),
    ooc BOOLEAN NOT NULL DEFAULT false,
    -- A whisper's recipient: the GM (from a player), or a player's character
    -- (from the GM). Only the author and the recipient see it.
    recipient_character_id UUID REFERENCES characters (id) ON DELETE SET NULL,
    recipient_user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    -- The breakdown of a roll or damage roll (see internal/models/chat.go).
    roll JSONB,
    CHECK ((kind IN ('roll', 'damage')) = (roll IS NOT NULL))
);

CREATE INDEX campaign_messages_campaign_id_id_idx ON campaign_messages (campaign_id, id DESC);

-- Announces each new message to every API instance listening on the
-- campaign_messages channel, which deliver it to their subscribers. NOTIFY is
-- sent when the inserting transaction commits.
CREATE FUNCTION notify_campaign_message () RETURNS trigger AS $$
BEGIN
    PERFORM pg_notify('campaign_messages', NEW.id::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_messages_notify
AFTER INSERT ON campaign_messages FOR EACH ROW
EXECUTE FUNCTION notify_campaign_message ();
