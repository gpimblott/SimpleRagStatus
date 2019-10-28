CREATE TABLE IF NOT EXISTS project_risk
(
    id                 SERIAL PRIMARY KEY,
    date_added         date,
    project_id         integer REFERENCES project (id) ON DELETE CASCADE,
    likelihood         rag_status,
    impact             rag_status,
    severity           rag_status,
    risk               TEXT,
    mitigating_action  TEXT,
    is_closed           bool
);