const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const reportDao = require("../dao/report");
const projectStatusDao = require("../dao/projectStatus");

const router = express.Router();

/**
 * Display the main report page selected by the report ID
 */
router.get('/:id(\\d+)/', security.isAuthenticated, (req, res) => {
    let reportId = parseInt(req.params.id);

    let allDefinedReports = [];

    reportDao.getAll()
        .then(result => {
            allDefinedReports = result;
            return projectStatusDao.getStatusReportByReportId(reportId);
        })
        .then(projectStatusReport => {

            let theReport = allDefinedReports.find(item => { return item.id === reportId });

            if (theReport !== undefined) {
                res.render('report',
                    {
                        layout: "report",
                        project_reports: allDefinedReports,
                        project_rag: projectStatusReport,
                        report: theReport
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

/**
 * Return all of the defined reports
 */
router.get('/', security.isAuthenticated, (req, res) => {

    reportDao.getAll()
        .then(reports => {
            res.render('listReports',
                {
                    layout: "management",
                    project_reports: reports,
                });
        })
        .catch(error => {
            res.render('error',
                {
                    message: "Error getting all reports",
                    error: error
                });
        });
    ;
});

router.get('/add', security.isAuthenticated, (req, res) => {

    reportDao.getAll()
        .then(reports => {
            res.render('addReport',
                {
                    layout: "management",
                    project_reports: reports,
                });
        })
        .catch(error => {
            res.render('error',
                {
                    message: "Error displaying report add page",
                    error: error
                });
        });
});

router.get('/edit/:id(\\d+)/', security.isAuthenticated, (req, res) => {
    let reportId = parseInt(req.params.id);

    let promises = [];
    promises.push( reportDao.getAll());
    promises.push( reportDao.getReportById( reportId ))

    Promise.all(promises)
        .then(results => {
            res.render('editReport',
                {
                    layout: "management",
                    project_reports: results[0],
                    report: results[1][0]
                });
        })
        .catch(error => {
            res.render('error',
                {
                    message: "Error displaying report editor page",
                    error: error
                });
        });
});

/**
 * Add a new report
 */
router.post('/', security.isAuthenticated, (req, res) => {
    reportDao.addReport(req.body.reportDate, req.body.reportDescription)
        .then(result => {
            res.redirect('/report');
        })
        .catch(error => {
            res.render('error',
                {
                    message: "Error adding new report",
                    error: error
                });
        });

});

router.post('/:id(\\d+)/', security.isAuthenticated, (req, res) => {
    let reportId = parseInt(req.params.id);

    reportDao.updateReport(reportId, req.body.reportDescription)
        .then(result => {
            res.redirect('/report');
        })
        .catch(error => {
            res.render('error',
                {
                    message: "Error adding new report",
                    error: error
                });
        });

});

router.delete('/:id(\\d+)/', security.isAuthenticated, (req, res) => {
    let reportId = parseInt(req.params.id);

    console.log("Delete report %s", reportId);

    reportDao.deleteReportById(reportId)
        .then(result => {
            console.log("Delete OK");
            res.sendStatus(200);
        })
        .catch(error => {
            logger.error("Error deleting report : %s", error);
            res.sendStatus(500);
        });
});

module.exports = router;