const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const reportDao = require("../dao/report");
const projectStatusDao = require("../dao/projectStatus");
const projectDao = require("../dao/project");

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
        reportDao.getMostRecent()
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

    reportDao.getAll()
        .then(result => {
            allDefinedReports = result;
            return projectStatusDao.getStatusReportByReportId(reportId);
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


router.get('/report', security.isAuthenticated, (req, res) => {

    reportDao.getAll()
        .then(reports => {
            res.render('manageReports',
                {
                    layout: "management",
                    project_reports: reports,
                });
        });
});

router.get('/project/:id(\\\\d+)/\'', security.isAuthenticated, (req, res) => {
    let projectId = parseInt(req.params.id);

    projectDao.getById(projectId)
        .then(project => {

            logger.info(project);

            res.render('project',
                {
                    layout: "management",
                    project: project,
                });
        });
});

module.exports = router;
