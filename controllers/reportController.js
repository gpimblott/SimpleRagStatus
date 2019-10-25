'use strict';

import ExcelReport from '../lib/generateExcel'

const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");

/**
 * Standard display of latest report
 * @param req
 * @param res
 */
exports.displayReport = function (req, res) {
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
            logger.error("Failed to display main report page: %s", error);
            res.render('error',
                {
                    message: "Failed to display main report page",
                    error: error
                });
        });
}

/**
 * Display the edit page for a report
 * @param req
 * @param res
 */
exports.editReport = function (req, res) {
    let reportId = parseInt(req.params.id);

    logger.info("Editing report : %s", reportId);

    reportDao.getReportById(reportId)
        .then(results => {
            res.render('editReport',
                {
                    report: results[ 0 ]
                });
        })
        .catch(error => {
            logger.error("Failed to display edit page: %s", error);
            res.render('error',
                {
                    message: "Error displaying edit page",
                    error: error
                });
        });
};

/**
 * Download a spreadsheet version of the report
 * @param req
 * @param res
 */
exports.downloadSpreadsheet = function (req, res) {

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
            logger.error("Error returning excel file : %s", error);
            res.sendStatus(500);
            res.end();
        });
};

/**
 * Add a new report
 * @param req
 * @param res
 */
exports.addReport = function (req, res) {

    logger.info("Adding new report");

    reportDao.addReport(req.body.reportDate, req.body.reportDescription)
        .then(result => {
            res.redirect('/report');
        })
        .catch(error => {
            logger.error("Failed to add new report : %s", error);
            res.render('error',
                {
                    message: "Error adding new report",
                    error: error
                });
        });
}

/**
 * Update an existing report
 * @param req
 * @param res
 */
exports.updateReport = function (req, res) {
    let reportId = parseInt(req.params.id);

    logger.info('Updating report : %d', reportId);

    reportDao.updateReport(reportId, req.body.reportDescription)
        .then(result => {
            res.redirect('/report');
        })
        .catch(error => {
            logger.error("Failed to update an existing report: %s", error);
            res.render('error',
                {
                    message: "Error updating existing report",
                    error: error
                });
        });
};

/**
 * Delete an existing report
 * @param req
 * @param res
 */
exports.deleteReport = function (req, res) {
    let reportId = parseInt(req.params.id);

    logger.info("Deleting report : %s", reportId);

    reportDao.deleteReportById(reportId)
        .then(result => {
            res.sendStatus(200);
        })
        .catch(error => {
            logger.error("Failed to delete report : %s", error);
            res.sendStatus(500);
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

