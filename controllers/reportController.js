'use strict';

const logger = require('../winstonLogger')(module);

import ExcelReport from '../lib/generateExcel'

const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");
const audit = require("../dao/auditDAO");

const ReportController = function () {
};

/**
 * Standard display of latest report
 * @param req
 * @param res
 */
ReportController.displayReport = function (req, res , next) {
    let reportId = req.reportId;

    projectStatusDao.getFullStatusReportByReportId(reportId)
        .then((ragReports) => {

            let scopeTotals = { red: 0, amber: 0, green: 0 };
            let scheduleTotals = { red: 0, amber: 0, green: 0 };
            let riskTotals = { red: 0, amber: 0, green: 0 };
            let benefitTotals = { red: 0, amber: 0, green: 0 };

            ragReports.forEach(item => {
                countColours(scopeTotals, item.scope);
                countColours(scheduleTotals, item.schedule);
                countColours(riskTotals, item.risk);
                countColours(benefitTotals, item.benefits);
            });

            let theReport = res.locals.project_reports.find(item => { return item.id === reportId });

            if (theReport !== undefined) {
                res.render('statusReports/ragReport',
                    {
                        project_rag: ragReports,
                        report: theReport,
                        scopeTotals: scopeTotals,
                        scheduleTotals: scheduleTotals,
                        riskTotals: riskTotals,
                        benefitTotals: benefitTotals
                    });
            } else {
                throw ("Can't find report for id " + reportId);
            }
        })
        .catch(error => {
            let err = new Error(`Filed to display main report page`); // Sets error message, includes the requester's ip address!
            next(err);
        });
};

/**
 * Display the edit page for a report
 * @param req
 * @param res
 */
ReportController.updateReportPage = function (req, res, next) {
    let reportId = req.reportId;

    logger.info("Editing report : %s", reportId);

    reportDao.getReportById(reportId)
        .then(results => {
            res.render('statusReports/editReport',
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
ReportController.updateReport = function (req, res, next ) {
    let reportId = req.reportId;

    logger.info('Updating report : %d', reportId);

    reportDao.updateReport(reportId, req.body.reportDescription)
        .then(result => {
            res.redirect('/report');
        })
        .then(() => {
            audit.write(req.user.username, `Report ${reportId} updated`);
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
 * @param next
 */
ReportController.addReport = function (req, res, next ) {

    logger.info("Adding new report");

    reportDao.addReport(req.body.reportDate, req.body.reportDescription)
        .then(result => {
            res.redirect('/report');
        })
        .then(() => {
            audit.write(req.user.username, `New report added`);
        })
        .catch(error => {
            let err = new Error(`Failed to add report`);
            err.statusCode = 500;
            next(err);
        });
};

/**
 * Delete an existing report
 * @param req
 * @param res
 * @param next
 */
ReportController.deleteReport = function (req, res, next) {
    let reportId = req.reportId;

    logger.info("Deleting report : %s", reportId);

    reportDao.deleteReportById(reportId)
        .then(result => {
            res.sendStatus(200);
        })
        .then(() => {
            audit.write(req.user.username, `Report ${reportId} deleted`);
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
 * @param next
 */
ReportController.downloadSpreadsheet = function (req, res, next) {
    let reportId = req.reportId;

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

module.exports = ReportController;

