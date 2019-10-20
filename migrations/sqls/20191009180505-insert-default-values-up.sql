/* Replace with your SQL commands */
INSERT INTO rag_status (name)
VALUES ('Red'),
       ('Amber'),
       ('Green');

INSERT INTO role(name, is_admin, is_editor )
VALUES ('Admin', true, true),
       ('User', false, false),
       ('Editor', false, true);