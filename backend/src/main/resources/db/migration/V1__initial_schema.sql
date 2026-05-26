-- Users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255),
    first_name  VARCHAR(255),
    last_name   VARCHAR(255),
    provider    VARCHAR(255),
    provider_id VARCHAR(255),
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- CVs
CREATE TABLE cvs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    template_id VARCHAR(255) NOT NULL,
    name        VARCHAR(255),
    email       VARCHAR(255),
    phone       VARCHAR(255),
    location    VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url  VARCHAR(255),
    summary     TEXT,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- Section order (ElementCollection)
CREATE TABLE cv_section_order (
    cv_id       UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    section_key VARCHAR(255),
    sort_index  INT NOT NULL,
    PRIMARY KEY (cv_id, sort_index)
);

-- Experiences
CREATE TABLE experiences (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company     VARCHAR(255) NOT NULL,
    role        VARCHAR(255) NOT NULL,
    start_date  VARCHAR(255),
    end_date    VARCHAR(255),
    description TEXT,
    cv_id       UUID REFERENCES cvs(id) ON DELETE CASCADE
);

-- Educations
CREATE TABLE educations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution     VARCHAR(255) NOT NULL,
    degree          VARCHAR(255),
    field           VARCHAR(255),
    graduation_year INT,
    cv_id           UUID REFERENCES cvs(id) ON DELETE CASCADE
);

-- Skills
CREATE TABLE skills (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name     VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    level    VARCHAR(255),
    cv_id    UUID REFERENCES cvs(id) ON DELETE CASCADE
);

-- Projects
CREATE TABLE projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    url         VARCHAR(255),
    cv_id       UUID REFERENCES cvs(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_experiences_cv_id ON experiences(cv_id);
CREATE INDEX idx_educations_cv_id ON educations(cv_id);
CREATE INDEX idx_skills_cv_id ON skills(cv_id);
CREATE INDEX idx_projects_cv_id ON projects(cv_id);
