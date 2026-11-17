-- Characters now belong to a user. Existing characters have no owner, and
-- nothing has been released, so they're deleted (their child rows cascade).
DELETE FROM characters;

CREATE TABLE users (
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    password_hash TEXT NOT NULL
);

-- Emails are unique case-insensitively.
CREATE UNIQUE INDEX users_email_key ON users (lower(email));

-- A login session. Only a SHA-256 hash of the cookie's token is stored, so a
-- leaked table can't be used to log in.
CREATE TABLE sessions (
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    token_hash BYTEA PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);

ALTER TABLE characters
ADD COLUMN owner_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE;

CREATE INDEX characters_owner_id_idx ON characters (owner_id);
