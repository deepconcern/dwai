DROP TABLE IF EXISTS session_reports;
DROP TABLE IF EXISTS campaign_sessions;
DROP TABLE IF EXISTS bonds;
ALTER TABLE characters DROP COLUMN IF EXISTS campaign_id;
DROP TABLE IF EXISTS campaigns;
