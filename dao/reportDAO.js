const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const Cache = require('../lib/dataCache');
const ttl = 60 * 60 * 1; // cache for 1 Hour
const cache = new Cache(ttl);

const ReportDAO = function () {
};

/**
 * Get all of the Reports - Ths cache is checked first, if it's not there then the DB is queried
 */
ReportDAO.getAll = function () {
    return cache.get("all", () => {
        return database.query(`SELECT *
                               FROM report
                               order by report_date desc`, [])
    });
};

/**
 * Add a new report - Thia forced the cache to be flushed
 * @param reportDate Date of the report
 * @param reportTitle Title of the report
 * @returns {Promise | Promise<unknown>}
 */
ReportDAO.addReport = function (reportDate, reportTitle) {
    cache.flush();
    return database.insertOrUpdate(
            `INSERT INTO report (report_date, title)
             VALUES ($1, $2)
             on CONFLICT DO NOTHING`,
        [reportDate, reportTitle]);
};

/**
 * Get the most recent report entry
 * @returns {Promise<unknown>}
 */
ReportDAO.getMostRecent = function () {
    return cache.get("most-recent", () => {
        return database.query("SELECT * FROM report ORDER BY report_date DESC LIMIT 1;");
    });
};

/**
 * Get all the reports for the specified project
 * @param projectId
 * @returns {Promise | Promise<unknown>}
 */
ReportDAO.getReportsForProjectById = function (projectId) {
    return database.query(
        `with rag as (
                SELECT ps.*
                FROM project_status ps
                WHERE project_id=$1
                )
                SELECT r.report_date,r.id as report_id,rag.risk, rag.schedule, rag.scope, rag.description
                FROM report r
                LEFT JOIN rag on rag.report_id=r.id
                ORDER BY report_date desc;`, [projectId]);
};

/**
 * Get a single report by it's ID
 * @param id
 * @returns {Promise | Promise<unknown>}
 */
ReportDAO.getReportById = function (id) {
    return database.query("select * from report where id=$1", [id]);
}

/**
 * Update the title of a report
 * @param id ID of the report
 * @param title The new title for the report
 * @returns {Promise | Promise<unknown>}
 */
ReportDAO.updateReport = function(id, title) {
    cache.flush();
    return database.insertOrUpdate(" UPDATE report set title=$1 where id=$2",[title,id]);
}

/**
 * Delete report by it's ID
 * This has cascade delete so all project status entries for this report will also be depleted
 * @param id
 * @returns {Promise | Promise<unknown>}
 */
ReportDAO.deleteReportById = function (id ){
    cache.flush();
    return database.deleteByIds( "report", [id]);
}

module.exports = ReportDAO;