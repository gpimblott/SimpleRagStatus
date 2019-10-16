const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const ProjectStatus = function () {
};

/**
 * Get all of the Pages
 */
ProjectStatus.getAll = function () {
    return database.query(
            `SELECT ps.report_date as date,
                    p.name         as name,
                    p.code         as code,
                    rs1.name       as risk,
                    rs2.name       as schedule,
                    rs3.name       as scope,
                    ps.description as description
             FROM project_status ps
                      JOIN project p on ps.project_id = p.id
                      JOIN rag_status rs1 on ps.risk_rag_status = rs1.id
                      JOIN rag_status rs2 on ps.schedule_rag_status = rs2.id
                      JOIN rag_status rs3 on ps.scope_rag_status = rs3.id;`,
        [])
};

ProjectStatus.getStatusReportByReportId = function (reportId) {
    return database.query(`with rag as (
     SELECT ps.*, p.name as project_name, p.code as code, r.report_date,
            LAG(ps.risk_status_id, 1) OVER (
                PARTITION BY project_id
                ORDER BY r.report_date asc
                ) previous_risk,
            LAG(ps.schedule_status_id, 1) OVER (
                PARTITION BY project_id
                ORDER BY r.report_date asc
                ) previous_schedule,
            LAG(ps.scope_status_id, 1) OVER (
                PARTITION BY project_id
                ORDER BY r.report_date asc
                ) previous_scope
     FROM project_status ps
     JOIN project p on ps.project_id = p.id
     JOIN report r on ps.report_id = r.id
     ORDER BY p.id, report_id desc
 )
SELECT rag.report_id, rag.description , rag.code, rag.project_name, rag.report_date,
       rs1.name as risk, rs2.name as schedule, rs3.name as scope,rag.project_id,
       previous_risk, previous_schedule, previous_scope,
       (rag.risk_status_id - previous_risk) as risk_direction,
       (rag.scope_status_id - previous_scope) as scope_direction,
       (rag.schedule_status_id - previous_schedule) as schedule_direction
FROM rag
JOIN rag_status rs1 on risk_status_id = rs1.id
JOIN rag_status rs2 on schedule_status_id = rs2.id
JOIN rag_status rs3 on scope_status_id = rs3.id
WHERE rag.report_id=$1`,
        [reportId])
};

module.exports = ProjectStatus;