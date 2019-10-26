'use strict';

const logger = require('../winstonLogger')(module);

import ExcelReport from '../lib/generateExcel'

const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");

/**
 * Standard display of latest report
 * @param req
 * @param res
 */
exports.displayReport = function (req, res , next) {
    let reportId = req.reportId;

    projectStatusDao.getStatusReportByReportId(reportId)
        .then((ragReports) => {

            let scopeTotals = { red: 0, amber: 0, green: 0 };
            let scheduleTotals = { red: 0, amber: 0, green: 0 };
            let riskTotals = { red: 0, amber: 0, green: 0 };

            ragReports.forEach(item => {
                countColours(scopeTotals, item.scope);
                countColours(scheduleTotals, item.schedule);
                countColours(riskTotals, item.risk);
            });

            let theReport = res.locals.project_reports.find(item => { return item.id === reportId });

            if (theReport !== undefined) {
                res.render('report',
                    {
                        project_rag: ragReports,
                        report: theReport,
                        scopeTotals: scopeTotals,
                        scheduleTotals: scheduleTotals,
                        riskTotals: riskTotals
                    });
            } else {
                throw ("Can't find report for id " + reportId);
            }
        })
        .catch(error => {
            let err = new Error(`Filed to display main report page`); // Sets error message, includes the requester's ip address!
            next(err);
        });
}

/**
 * Display the edit page for a report
 * @param req
 * @param res
 */
exports.updateReportPage = function (req, res, next) {
    let reportId = req.reportId;

    logger.info("Editing report : %s", reportId);

    reportDao.getReportById(reportId)
        .then(results => {
            res.render('editReport',
                {
                    report: results[ 0 ]
                });
        })
        .catch(error => {
            let err = new Error(`Failed to display Report update page`);
            err.statusCode = 500;
            next(err);
        });
};

/**
 * Update an existing report
 * @param req
 * @param res
 */
exports.updateReport = function (req, res, next ) {
    let reportId = req.reportId;

    logger.info('Updating report : %d', reportId);

    reportDao.updateReport(reportId, req.body.reportDescription)
        .then(result => {
            res.redirect('/report');
        })
        .catch(error => {
            let err = new Error(`Failed to update report`);
            err.statusCode = 500;
            next(err);
        });
};

/**
 * Add a new report
 * @param req
 * @param res
 */
exports.addReport = function (req, res, next ) {

    logger.info("Adding new report");

    reportDao.addReport(req.body.reportDate, req.body.reportDescription)
        .then(result => {
            res.redirect('/report');
        })
        .catch(error => {
            let err = new Error(`Failed to add report`);
            err.statusCode = 500;
            next(err);
        });
}

/**
 * Delete an existing report
 * @param req
 * @param res
 */
exports.deleteReport = function (req, res, next) {
    let reportId = req.reportId;

    logger.info("Deleting report : %s", reportId);

    reportDao.deleteReportById(reportId)
        .then(result => {
            res.sendStatus(200);
        })
        .catch(error => {
            let err = new Error(`Failed to add report`);
            err.statusCode = 500;
            next(err);
        });
};


/**
 * Download a spreadsheet version of the report
 * @param req
 * @param res
 */
exports.downloadSpreadsheet = function (req, res, next) {

    logger.info("Downloading spreadsheet");

    let report = new ExcelReport();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");

    report.createExcelReport(reportId)
        .then(workbook => {
            return report.saveWorkbookToStream(res);
        })
        .then(result => {
            res.end();
        })
        .catch(error => {
            let err = new Error(`Error generating spreadsheet`);
            err.statusCode = 500;
            next(err);
        });
};

function countColours (totals, item) {
    switch (item) {
        case 'Red' :
            totals.red += 1;
            break;
        case 'Amber' :
            totals.amber += 1;
            break;
        case 'Green' :
            totals.green += 1;
    }
}

