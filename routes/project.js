'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const projectController = require("../controllers/projectController");
const riskController = require("../controllers/riskController");

const projectDAO = require("../dao/projectDAO");

const router = express.Router();

router.param('reportId', function (req, res, next, id) {
    req.reportId = parseInt(id);
    next();
});

router.param('riskId', function (req, res, next, id) {
    req.riskId = parseInt(id);
    next();
});

/**
 * For routes that use projectId retrieve the project details
 */
router.param('projectId', function (req, res, next, id) {
    req.projectId = parseInt(id);

    if( req.method==='GET') {
        projectDAO.getProjectById(id)
            .then(result => {
                req.project = result[ 0 ];
                next();
            })
            .catch(error => {
                next(error);
            });
    } else {
        next();
    }

});

/**
 * Show all of the projects
 */
router.get('/', security.isAuthenticated, (req, res) => {
    let action = (req.query.action || "view").toLowerCase();

    if (action === 'add') {
        projectController.displayAddProjectPage(req, res);
    } else {
        projectController.displayAllProjects(req,res);
    }
});

/**
 * Get a specific project
 */
router.get('/:projectId(\\d+)/', security.isAuthenticated, (req, res) => {
    let action = (req.query.action || "view").toLowerCase();

    if (action === 'edit') {
        projectController.displayEditProjectPage(req, res);
    } else {
        projectController.displayProjectPage(req, res);
    }
});

/**
 * Display risk page or page to  add a new risk
 */
router.get('/:projectId(\\d+)/risk/', security.isAuthenticated, (req, res) => {
    let action = (req.query.action || "view").toLowerCase();

    if (action === 'add') {
        riskController.displayAddRiskPage(req, res);
    } else {
        riskController.displayRisksForProjectPage(req, res);
    }
});

/**
 * Add a new risk for a project
 */
router.post('/:projectId(\\d+)', security.isAuthenticatedEditor, projectController.updateProject);

/**
 * Add a new risk for a project
 */
router.post('/:projectId(\\d+)/risk', security.isAuthenticatedEditor, riskController.addProjectRisk);

/**
 * Edit a project report
 */
router.get('/:projectId(\\d+)/report/:reportId(\\d+)', security.isAuthenticated, projectController.displayUpdateProjectReportPage);

/**
 * Update the report for a project
 */
router.post('/:projectId(\\d+)/report/:reportId(\\d+)', security.isAuthenticatedEditor, projectController.updateProjectReport);

/**
 * Add a new project
 */
router.post('/', security.isAuthenticatedEditor, projectController.addProject );

router.delete('/:projectId(\\d+)', security.isAuthenticatedEditor, projectController.deleteProject );

module.exports = router;