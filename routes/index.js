const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const report = require("../dao/report");
const projectStatus = require("../dao/projectStatus");

const router = express.Router();

/**
 * The default page - currently just redirects to the latest report
 */
router.get('/', security.isAuthenticated, (req, res) => {
    const url = req.session.redirect_to;
    if (url !== undefined) {
        delete req.session.redirect_to;
        res.redirect(url);
    } else {
        report.getMostRecent()
            .then(result => {
                res.redirect('/report/' + result[ 0 ].id)
            })
    }
});

/**
 * Display the main report page selected by the report ID
 */
router.get('/report/:id(\\d+)/', security.isAuthenticated, (req, res) => {
    let reportId = parseInt(req.params.id);

    let allDefinedReports = [];

    report.getAll()
        .then(result => {
            allDefinedReports = result;
            return projectStatus.getStatusReportByReportId(reportId);
        })
        .then(projectStatusReport => {

            let theReport = allDefinedReports.find( item =>{ return item.id===reportId });

            if (theReport !== undefined) {
                res.render('report',
                    {
                        layout: "report",
                        project_reports: allDefinedReports,
                        project_rag: projectStatusReport,
                        report_date: theReport.report_date
                    });
            } else {
                throw ("Can't find report for id " + reportId);
            }
        })
        .catch(error => {
            logger.error("Failed to generate report : %s", error);
            res.sendStatus(500);
        });
});

module.exports = router;
