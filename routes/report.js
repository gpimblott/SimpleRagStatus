'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");

const router = express.Router();

/**
 * Display report by Id
 */
router.get('/:id(\\d+)/', security.isAuthenticated, (req, res) => {
    let reportId = parseInt(req.params.id);

    logger.info("Display current report");

    projectStatusDao.getStatusReportByReportId(reportId)
        .then(projectStatusReport => {

            let theReport = res.locals.project_reports.find(item => { return item.id === reportId });

            if (theReport !== undefined) {
                res.render('report',
                    {
                        project_rag: projectStatusReport,
                        report: theReport
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
});

/**
 * Return all of the defined reports
 */
router.get('/', security.isAuthenticated, (req, res) => {

    res.render('listReports', {});
});

/**
 * Display the add page
 */
router.get('/add', security.isAuthenticatedAdmin, (req, res) => {
    res.render('addReport', {});
});

/**
 * Display the edit page
 */
router.get('/edit/:id(\\d+)/', security.isAuthenticatedAdmin, (req, res) => {
    let reportId = parseInt(req.params.id);

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
});

/**
 * Add a new report
 */
router.post('/', security.isAuthenticatedAdmin, (req, res) => {
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

});

/**
 * Update a report (POST to an existing ID)
 */
router.post('/:id(\\d+)/', security.isAuthenticatedAdmin, (req, res) => {
    let reportId = parseInt(req.params.id);

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

});

/**
 * Delete a report by ID
 */
router.delete('/:id(\\d+)/', security.isAuthenticatedAdmin, (req, res) => {
    let reportId = parseInt(req.params.id);

    logger.info("Delete report %s", reportId);

    reportDao.deleteReportById(reportId)
        .then(result => {
            res.sendStatus(200);
        })
        .catch(error => {
            logger.error("Failed to delete report : %s", error);
            res.sendStatus(500);
        });
});

module.exports = router;