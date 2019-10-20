CREATE TABLE IF NOT EXISTS rag_status
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(10) UNIQUE
);

CREATE TABLE IF NOT EXISTS project_group
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS project
(
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) UNIQUE,
    code          VARCHAR(20),
    project_group_id INTEGER REFERENCES project_group (id) ON DELETE CASCADE,
    description   TEXT
);

CREATE TABLE IF NOT EXISTS report
(
    id          SERIAL PRIMARY KEY,
    title       TEXT,
    report_date date UNIQUE
);

CREATE TABLE IF NOT EXISTS project_status
(
    id                 SERIAL PRIMARY KEY,
    project_id         integer REFERENCES project (id),
    schedule_status_id integer REFERENCES rag_status (id) ON DELETE CASCADE,
    scope_status_id    integer REFERENCES rag_status (id) ON DELETE CASCADE,
    risk_status_id     integer REFERENCES rag_status (id) ON DELETE CASCADE,
    report_id          integer REFERENCES report (id) ON DELETE CASCADE,
    description        TEXT,
    unique (report_id, project_id)
);

CREATE TABLE IF NOT EXISTS role
(
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) UNIQUE,
    is_admin boolean default false,
    is_editor boolean default false
);

CREATE TABLE IF NOT EXISTS account
(
    id        SERIAL PRIMARY KEY,
    firstName VARCHAR(50),
    surname   VARCHAR(50),
    username  VARCHAR(100) UNIQUE,
    email     VARCHAR(100),
    role_id   integer REFERENCES role (id) ON DELETE CASCADE,
    password  VARCHAR(100),
    enabled   boolean default true
);

