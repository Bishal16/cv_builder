ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Grandfather all existing accounts as verified so nobody is locked out.
UPDATE users SET email_verified = TRUE;

-- OAuth accounts are inherently provider-verified.
UPDATE users SET email_verified = TRUE WHERE provider_id IS NOT NULL;

CREATE TABLE email_verification_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evt_token   ON email_verification_tokens(token);
CREATE INDEX idx_evt_user_id ON email_verification_tokens(user_id);
