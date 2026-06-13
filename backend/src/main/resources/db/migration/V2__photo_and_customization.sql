-- Phase 2: profile photo (stored as base64 data-URL, hence TEXT)
ALTER TABLE cvs ADD COLUMN photo_url TEXT;

-- Phase 3: per-CV customization overrides
ALTER TABLE cvs ADD COLUMN accent_color VARCHAR(32);
ALTER TABLE cvs ADD COLUMN font_family  VARCHAR(16);
ALTER TABLE cvs ADD COLUMN density      VARCHAR(16);
