'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const projectController = require("../controllers/projectController");
const riskController = require("../controllers/riskController");

const projectDAO = require("../dao/projectDAO");

const router = express.Router();

/**
 * Intercept reportId parameter and set in request
 */
router.param('reportId', function (req, res, next, id) {
    req.reportId = parseInt(id);
    next();
});

/**
 * Intercept riskId parameter and set in request
 */
router.param('riskId', function (req, res, next, id) {
    req.riskId = parseInt(id);
    next();
});

/**
 * For routes that use projectId parameter retrieve the project details
 */
router.param('projectId', function (req, res, next, id) {
    req.projectId = parseInt(id);

    if (req.method === 'GET') {
        projectDAO.getProjectById(id)
            .then(result => {
                req.project = result[0];
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
 * Show all of the projects or the add project page if the 'action' parameter is set
 */
router.get('/', security.isAuthenticatedAdminWithAction, (req, res, next) => {

    if (req.action === 'add') {
        projectController.displayAddProjectPage(req, res, next);
    } else {
        projectController.displayAllProjects(req, res, next);
    }
});

/**
 * Get a specific project or edit page if the 'action' parameter is set
 */
router.get('/:projectId(\\d+)/', security.isAuthenticatedAdminWithAction, (req, res, next) => {

    if (req.action === 'edit') {
        projectController.displayEditProjectPage(req, res, next);
    } else {
        projectController.displayProjectPage(req, res, next);
    }
});

/**
 * Get a specific project or the edit page if the 'action' parameter is set
 */
router.get('/:projectId(\\d+)/', security.isAuthenticatedAdminWithAction, (req, res, next) => {

    if (req.action === 'edit') {
        projectController.displayEditProjectPage(req, res, next);
    } else {
        projectController.displayProjectPage(req, res, next);
    }
});


/**
 * Display risk page or page to add a new risk if the action parameter is set
 */
router.get('/:projectId(\\d+)/risk/', security.isAuthenticatedEditorWithAction, (req, res, next) => {

    if (req.action === 'add') {
        riskController.displayAddRiskPage(req, res, next);
    } else {
        riskController.displayRisksForProjectPage(req, res, next);
    }
});

/**
 * Edit a project report
 */
router.get('/:projectId(\\d+)/report/:reportId(\\d+)', security.isAuthenticatedEditor,
    projectController.displayUpdateProjectReportPage);

/************************** The methods below require the user to be an EDITOR or Admin*******************/
/**
 * Update a project
 */
router.post('/:projectId(\\d+)', security.isAuthenticatedAdmin, projectController.updateProject);

/**
 * Add a new risk for a project
 */
router.post('/:projectId(\\d+)/risk', security.isAuthenticatedEditor, riskController.addProjectRisk);

/**
 * Update the report for a project
 */
router.post('/:projectId(\\d+)/report/:reportId(\\d+)', security.isAuthenticatedEditor, projectController.updateProjectReport);

/**
 * Add a new project
 */
router.post('/', security.isAuthenticatedAdmin, projectController.addProject);

/**
 * Delete a project
 */
router.delete('/:projectId(\\d+)', security.isAuthenticatedAdmin, projectController.deleteProject);

module.exports = router;