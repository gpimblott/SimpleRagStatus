'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const projectDao = require("../dao/project");
const reportDao = require("../dao/report");
const projectStatusDao = require("../dao/projectStatus");

const router = express.Router();

/**
 * Get a specific project
 */
router.get('/:id(\\d+)/', security.isAuthenticated, (req, res) => {
    let projectId = parseInt(req.params.id);

    let promises = [];
    promises.push(projectDao.getProjectById(projectId));
    promises.push(reportDao.getProjectReports(projectId));

    logger.info("Get project %s", projectId);

    Promise.all(promises)
        .then(result => {
            res.render('project',
                {
                    project: result[ 0 ][ 0 ],
                    reports: result[ 1 ]
                });
        })
        .catch(error => {
            logger.error("Failed to get project page: %s", error);
            res.render('error',
                {
                    message: "Error adding new report",
                    error: error
                });
        });
});

/**
 * Edit a project report
 */
router.get('/:projectId(\\d+)/report/:reportId(\\d+)', security.isAuthenticated, (req, res) => {
    let projectId = parseInt(req.params.projectId);
    let reportId = parseInt(req.params.reportId);

    logger.info("Edit project (%s) report (%s)", projectId, reportId);

    let promises = [];
    promises.push(reportDao.getReportById(reportId));
    promises.push(projectDao.getProjectById(projectId));
    promises.push(projectStatusDao.getRAGStatusValues());
    promises.push(projectStatusDao.getClosestReportForApplication(projectId, reportId));

    Promise.all(promises)
        .then(result => {

            let currentReport = result[ 0 ][ 0 ];
            let currentProject = result[ 1 ][ 0 ];
            let ragValues = result[ 2 ];
            let latestReport = result[ 3 ][ 0 ];

            if (currentProject === undefined || currentReport === undefined || ragValues === undefined) {
                throw("Unable to find record");
            }

            res.render('updateReport',
                {
                    report: currentReport,
                    project: currentProject,
                    ragValues: ragValues,
                    latestReport: latestReport,
                });
        })
        .catch(error => {
            logger.error("Failed to get edit project page : %s", error);
            res.render('error',
                {
                    message: "Error adding new report",
                    error: error
                });
        });
});

/**
 * Update the report for a project
 */
router.post('/:projectId(\\d+)/report/:reportId(\\d+)', security.isAuthenticatedEditor, (req, res) => {
    let projectId = parseInt(req.params.projectId);
    let reportId = parseInt(req.params.reportId);

    logger.info("Update project (%s) report (%s)", projectId, reportId);

    projectStatusDao.updateProjectStatus(projectId, reportId, req.body)
        .then(result => {
            res.redirect("/project/" + projectId);
        })
        .catch(error => {
            logger.error("Failed to update project : %s", error);
            res.render('error',
                {
                    message: "Error adding new report",
                    error: error
                });
        });
});

module.exports = router;