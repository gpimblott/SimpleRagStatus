ALTER TABLE project
    ADD COLUMN IF NOT EXISTS product_owner TEXT,
    ADD COLUMN IF NOT EXISTS tech_lead TEXT;

CREATE TABLE IF NOT EXISTS project_milestone
(
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(250),
    description   TEXT,
    date          DATE,
    project_id    INTEGER REFERENCES project (id) ON DELETE CASCADE
);
