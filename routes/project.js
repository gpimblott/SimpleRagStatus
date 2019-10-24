'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const projectDao = require("../dao/projectDAO");
const reportDao = require("../dao/reportDAO");
const riskDao = require("../dao/riskDAO");
const projectStatusDao = require("../dao/projectStatusDAO");

const router = express.Router();

/**
 * Get a specific project
 */
router.get('/:id(\\d+)/', security.isAuthenticated, (req, res) => {
    let projectId = parseInt(req.params.id);

    let promises = [];
    promises.push(projectDao.getProjectById(projectId));
    promises.push(reportDao.getReportsForProjectById(projectId));

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
                    message: "Error getting project report",
                    error: error
                });
        });
});

/**
 * Get a the risks for a project
 */
router.get('/:id(\\d+)/risk', security.isAuthenticated, (req, res) => {
    let projectId = parseInt(req.params.id);

    riskDao.getRiskByProjectId(projectId)
        .then(risks => {
            res.render('listProjectRisks',
                {
                    risks: risks,
                    projectId: projectId
                });
        })
        .catch(error => {
            logger.error("Failed to get project risks: %s", error);
            res.render('error',
                {
                    message: "Error getting project risks",
                    error: error
                });
        });
});

/**
 * Add a new risk for a project
 */
router.post('/:id(\\d+)/risk', security.isAuthenticated, (req, res) => {
    let projectId = parseInt(req.params.id);

    console.log(req.body);
    riskDao.addRisk(projectId, req.body)
        .then(result => {
            res.redirect('/project/' + projectId + '/risk');
        });
});

/**
 * Display page to add a new risk
 */
router.get('/:id(\\d+)/risk/add', security.isAuthenticated, (req, res) => {
    let projectId = parseInt(req.params.id);

    let promises = [];
    promises.push(projectStatusDao.getRAGStatusValues());
    promises.push(riskDao.getRiskByProjectId(projectId));
    promises.push(projectDao.getProjectById(projectId));

    Promise.all(promises)
        .then(results => {
            let risks = results[ 1 ];
            let ragStatus = results[ 0 ];
            let project = results[ 2 ][ 0 ];

            res.render('addRisk',
                {
                    ragValues: ragStatus,
                    risks: risks,
                    projectId: projectId,
                    project: project
                });
        })
        .catch(error => {
            logger.error("Failed to add project risk: %s", error);
            res.render('error',
                {
                    message: "Error adding project risk",
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

    projectStatusDao.updateProjectStatusForReportById(projectId, reportId, req.body)
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