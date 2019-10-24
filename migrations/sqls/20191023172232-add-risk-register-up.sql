CREATE TABLE IF NOT EXISTS project_risk
(
    id                 SERIAL PRIMARY KEY,
    date_added         date,
    project_id         integer REFERENCES project (id) ON DELETE CASCADE,
    likelihood_id      integer REFERENCES rag_status (id) ON DELETE CASCADE,
    impact_id          integer REFERENCES rag_status (id) ON DELETE CASCADE,
    severity_id        integer REFERENCES rag_status (id) ON DELETE CASCADE,
    risk               TEXT,
    mitigating_action  TEXT,
    is_closed           bool
);