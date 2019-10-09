/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS role
(
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(50) UNIQUE,
    is_admin boolean default false
);

CREATE TABLE IF NOT EXISTS account
(
    id        SERIAL PRIMARY KEY,
    firstName VARCHAR(50),
    surname   VARCHAR(50),
    username  VARCHAR(100) UNIQUE,
    email     VARCHAR(100),
    role_id   integer REFERENCES role (id),
    password  VARCHAR(100),
    enabled   boolean default true
);