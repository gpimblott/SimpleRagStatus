CREATE TABLE IF NOT EXISTS rag_status
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(10) UNIQUE
);

CREATE TABLE IF NOT EXISTS project_group
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE
);

CREATE TABLE IF NOT EXISTS project
(
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(50) UNIQUE,
    code          VARCHAR(10) UNIQUE,
    project_group INTEGER REFERENCES project_group (id),
    description   TEXT
);

CREATE TABLE IF NOT EXISTS project_status
(
    id                  SERIAL PRIMARY KEY,
    project_id          integer REFERENCES project (id),
    schedule_rag_status integer REFERENCES rag_status (id),
    scope_rag_status    integer REFERENCES rag_status (id),
    risk_rag_status     integer REFERENCES rag_status (id),
    description         TEXT
);