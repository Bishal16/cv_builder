CREATE TABLE certifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id       UUID        NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    issuer      VARCHAR(255),
    issue_date  VARCHAR(32),
    expiry_date VARCHAR(32)
);

CREATE TABLE languages (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id       UUID        NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    proficiency VARCHAR(32)
);

CREATE TABLE awards (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id       UUID        NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    issuer      VARCHAR(255),
    date        VARCHAR(32),
    description TEXT
);
