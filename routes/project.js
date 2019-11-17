'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const projectController = require("../controllers/projectController");

const projectDAO = require("../dao/projectDAO");

// Subroutes for
// /project/:id/milestone
// /project/:id/risk
const milestoneRoutes = require('./milestone');
const riskRoutes = require('./risk');
const projectStatusRoutes = require('./projectStatus');

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
 * Add a new project
 */
router.post('/', security.isAuthenticatedAdmin, projectController.addProject);

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
 * Update a project
 */
router.post('/:projectId(\\d+)', security.isAuthenticatedAdmin, projectController.updateProject);

/**
 * Delete a project
 */
router.delete('/:projectId(\\d+)', security.isAuthenticatedAdmin, projectController.deleteProject);

// Setup the sub routes
router.use('/:projectId(\\d+)/status', projectStatusRoutes);
router.use('/:projectId(\\d+)/risk', riskRoutes);
router.use('/:projectId(\\d+)/milestone', milestoneRoutes);

module.exports = router;