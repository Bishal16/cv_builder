CREATE TABLE share_links (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id      UUID         NOT NULL UNIQUE REFERENCES cvs(id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    enabled    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_share_links_token ON share_links(token);
