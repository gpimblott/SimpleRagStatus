const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const ProjectStatus = function () {
};


/**
 * This query is pretty horrible - need to check how performant it is
 * @param reportId
 * @returns {Promise<unknown>}
 */
ProjectStatus.getStatusReportByReportId = function (reportId) {
    return database.query(`with rag as (SELECT ps.*,
                    r.report_date,
                    rs1.name as risk,
                    rs2.name as schedule,
                    rs3.name as scope,
                    LAG(ps.risk_status_id, 1) OVER (
                        PARTITION BY project_id
                        ORDER BY r.report_date asc
                        )       previous_risk,
                    LAG(ps.schedule_status_id, 1) OVER (
                        PARTITION BY project_id
                        ORDER BY r.report_date asc
                        )       previous_schedule,
                    LAG(ps.scope_status_id, 1) OVER (
                        PARTITION BY project_id
                        ORDER BY r.report_date asc
                        )       previous_scope
             FROM project_status ps
                      --JOIN project p on ps.project_id = p.id
                      JOIN report r on ps.report_id = r.id
                      JOIN rag_status rs1 on risk_status_id = rs1.id
                      JOIN rag_status rs2 on schedule_status_id = rs2.id
                      JOIN rag_status rs3 on scope_status_id = rs3.id
             ORDER BY report_id desc
)
select p.name as project_name,
       rag.report_id,
       rag.description,
       p.code,
       rag.report_date,
       rag.risk,
       rag.schedule,
       rag.scope,
       p.id as project_id,
       previous_risk,
       previous_schedule,
       previous_scope,
       (rag.risk_status_id - previous_risk)         as risk_direction,
       (rag.scope_status_id - previous_scope)       as scope_direction,
       (rag.schedule_status_id - previous_schedule) as schedule_direction
from project p
         left join (select * from rag where report_id = $1) rag on rag.project_id = p.id
         order by project_name`,
        [reportId])
};

module.exports = ProjectStatus;