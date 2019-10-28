CREATE TABLE IF NOT EXISTS project_phase
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

ALTER TABLE project
ADD COLUMN phase int references project_phase (id) ON DELETE CASCADE;

INSERT INTO project_phase(name)
VALUES ('Prep'),('Discovery'),('Alpha'),('Beta'),('Live');

UPDATE project set phase=(select id from project_phase where name='Alpha');