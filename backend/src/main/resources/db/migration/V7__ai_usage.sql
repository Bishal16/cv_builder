-- Single global row tracking the app's shared AI request window.
-- The CHECK (id) constraint guarantees there can only ever be one row (id = TRUE).
CREATE TABLE ai_usage_window (
    id            BOOLEAN   PRIMARY KEY DEFAULT TRUE CHECK (id),
    window_start  TIMESTAMP,
    request_count INTEGER   NOT NULL DEFAULT 0
);

INSERT INTO ai_usage_window (id, window_start, request_count) VALUES (TRUE, NULL, 0);
