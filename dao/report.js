const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const Cache = require('../lib/dataCache');
const ttl = 60 * 60 * 1; // cache for 1 Hour
const cache = new Cache(ttl);

const Report = function () {
};

/**
 * Get all of the Reports - Ths cache is checked first, if it's not there then the DB is queried
 */
Report.getAll = function () {
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
Report.addReport = function (reportDate, reportTitle) {
    cache.flush();
    return database.insertOrUpdate(
            `INSERT INTO report (report_date, title)
             VALUES ($1, $2)
             on CONFLICT DO NOTHING`,
        [reportDate, reportTitle]);
};

Report.getMostRecent = function () {
    return cache.get("most-recent", () => {
        return database.query("SELECT * FROM report ORDER BY report_date DESC LIMIT 1;");
    });
};

module.exports = Report;