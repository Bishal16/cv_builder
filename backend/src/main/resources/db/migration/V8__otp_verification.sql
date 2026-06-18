-- OTP support: a short numeric code + an attempt counter on the existing
-- verification token row. The unique `token` column keeps a UUID for uniqueness;
-- the 6-digit code (not unique across users) is matched per user.
ALTER TABLE email_verification_tokens ADD COLUMN code VARCHAR(6);
ALTER TABLE email_verification_tokens ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
