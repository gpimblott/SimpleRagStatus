CREATE TYPE rag_status AS ENUM ('Red','Amber','Green');

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
    project_id         integer REFERENCES project (id) ON DELETE CASCADE,

    schedule            rag_status,
    scope               rag_status,
    risk                rag_status,
    benefits            rag_status,
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


INSERT INTO role (name,is_admin,is_editor) VALUES ( 'Admin', true, true ),('User', false, false), ('Editor',false, true);

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

