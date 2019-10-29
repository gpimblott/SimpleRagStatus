ALTER TABLE project_status
    ADD COLUMN schedule_text TEXT DEFAULT '';

ALTER TABLE project_status
    ADD COLUMN scope_text TEXT DEFAULT '';

ALTER TABLE project_status
    ADD COLUMN risk_text TEXT DEFAULT '';

ALTER TABLE project_status
    ADD COLUMN benefits_text TEXT DEFAULT '';

ALTER TABLE project_status
    DROP COLUMN description;