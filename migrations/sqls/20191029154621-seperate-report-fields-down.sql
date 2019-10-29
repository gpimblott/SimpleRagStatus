ALTER TABLE project_status
    DROP COLUMN schedule_text;

ALTER TABLE project_status
    DROP COLUMN scope_text;

ALTER TABLE project_status
    DROP COLUMN risk_text;

ALTER TABLE project_status
    DROP COLUMN benefits_text;

ALTER TABLE project_status
    ADD COLUMN description TEXT DEFAULT '';
