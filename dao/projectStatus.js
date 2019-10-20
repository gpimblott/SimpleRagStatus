const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const ProjectStatus = function () {
};

ProjectStatus.updateProjectStatus = function ( projectId, reportId , update ) {
    return database.insertOrUpdate(
        `INSERT INTO project_status (project_id, report_id, 
                            risk_status_id, scope_status_id, schedule_status_id,
                            description ) VALUES ( $1, $2, $3, $4, $5, $6 )
                            ON CONFLICT  ON CONSTRAINT project_status_report_id_project_id_key
                                DO UPDATE 
                            SET risk_status_id=$3, scope_status_id=$4, schedule_status_id=$5 , description=$6` ,
        [projectId , reportId , update.risk, update.scope, update.schedule, update.reportUpdate ]);
}

/**
 * Get all of the RAG status values
 * @returns {Promise | Promise<unknown>}
 */
ProjectStatus.getRAGStatusValues = function () {
    return database.query( "select * from rag_status order by id",[]);
}

/**
 * Get the latest completed report for the given application and report
 * @param applicationId
 * @param reportId
 * @returns {Promise | Promise<unknown>}
 */
ProjectStatus.getClosestReportForApplication = function ( applicationId , reportId ) {
    return database.query (
        `select r.*,ps.* from report r
            join project_status ps on r.id=ps.report_id
            where project_id=$1 and r.report_date <= (select report_date from report where id=$2)
            order by r.report_date desc
            limit 1;`,
        [applicationId,reportId]);
}

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