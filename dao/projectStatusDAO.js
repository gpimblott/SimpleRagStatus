'use strict';

const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const ProjectStatusDAO = function () {
};

/**
 * Update the status of a project for the specified project
 * The update is in a simple object
 * {
 *     risk:        //  ID of the RAG status
 *     scope:       // ID of the RAG status
 *     schedule:    // ID of the RAG status
 *     reportUpdate:// Text update of the report
 * }
 *
 * @param projectId ID of the project to update
 * @param reportId ID of the report to update
 * @param update object containing the update
 * @returns {Promise | Promise<unknown>}
 */
ProjectStatusDAO.updateProjectStatusForReportById = function (projectId, reportId , update ) {
    return database.insertOrUpdate(
        `INSERT INTO project_status (project_id, report_id, 
                            risk, scope, schedule, benefits,
                            risk_text, scope_text, schedule_text, benefits_text ) 
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )
            ON CONFLICT  ON CONSTRAINT project_status_report_id_project_id_key
            DO UPDATE 
            SET risk=$3, scope=$4, schedule=$5,benefits=$6, 
                risk_text=$7, scope_text=$8, schedule_text=$9, benefits_text=$10`,
        [projectId , reportId , update.risk, update.scope, update.schedule, update.benefits,
            update.risk_text, update.scope_text ,update.schedule_text,update.benefits_text ]);
};

/**
 * Get the latest completed report for the given application and report
 * @param applicationId
 * @param reportId
 * @returns {Promise | Promise<unknown>}
 */
ProjectStatusDAO.getClosestReportForApplication = function (applicationId , reportId ) {
    return database.query (
        `select r.*,ps.* from report r
            join project_status ps on r.id=ps.report_id
            where project_id=$1 and r.report_date <= (select report_date from report where id=$2)
            order by r.report_date desc
            limit 1`,
        [applicationId,reportId]);
};

/**
 * Monster query to get all the details for a report
 * It is so complicated as it gets the previous status values
 *
 * @param reportId
 * @returns {Promise<unknown>}
 */
ProjectStatusDAO.getStatusReportByReportId = function (reportId) {
    return database.query(`with rag as (
                SELECT ps.*,
                    r.report_date,
                    LAG(ps.risk, 1) OVER (
                        PARTITION BY project_id
                        ORDER BY r.report_date asc
                        )       previous_risk,
                    LAG(ps.schedule, 1) OVER (
                        PARTITION BY project_id
                        ORDER BY r.report_date asc
                        )       previous_schedule,
                    LAG(ps.scope, 1) OVER (
                        PARTITION BY project_id
                        ORDER BY r.report_date asc
                        )       previous_scope,
                    LAG(ps.benefits, 1) OVER (
                        PARTITION BY project_id
                        ORDER BY r.report_date asc
                        )       previous_benefits
             FROM project_status ps
                JOIN report r on ps.report_id = r.id
             ORDER BY report_id desc
)
select p.name as project_name,
       rag.report_id,
       rag.risk_text,
       rag.scope_text,
       rag.schedule_text,
       rag.benefits_text,
       p.code,
       rag.report_date,
       rag.risk,
       rag.schedule,
       rag.scope,
       rag.benefits,
       p.id as project_id,
       previous_risk,
       previous_schedule,
       previous_scope,
       previous_benefits
from project p
         left join (select * from rag where report_id = $1) rag on rag.project_id = p.id
         order by project_name`,
        [reportId])
};

module.exports = ProjectStatusDAO;