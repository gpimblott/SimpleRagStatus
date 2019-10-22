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

ReportDAO.getMostRecent = function () {
    return cache.get("most-recent", () => {
        return database.query("SELECT * FROM report ORDER BY report_date DESC LIMIT 1;");
    });
};

ReportDAO.getProjectReports = function (projectId) {
    return database.query(
        `with rag as (
    select ps.*,
            rs1.name as risk,
            rs2.name as schedule,
            rs3.name as scope
    from project_status ps
        JOIN rag_status rs1 on risk_status_id = rs1.id
        JOIN rag_status rs2 on schedule_status_id = rs2.id
        JOIN rag_status rs3 on scope_status_id = rs3.id
        WHERE project_id=$1
    )
    SELECT r.report_date,r.id as report_id,rag.risk, rag.schedule, rag.scope, rag.description
    FROM report r
    LEFT JOIN rag on rag.report_id=r.id
    ORDER BY report_date desc;`, [projectId]);
};


ReportDAO.getReportById = function (id) {
    return database.query("select * from report where id=$1", [id]);
}

ReportDAO.updateReport = function(id, title) {
    cache.flush();
    return database.insertOrUpdate(" UPDATE report set title=$1 where id=$2",[title,id]);
}

ReportDAO.deleteReportById = function (id ){
    cache.flush();
    return database.deleteByIds( "report", [id]);
}

module.exports = ReportDAO;