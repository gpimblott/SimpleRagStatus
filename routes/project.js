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

/**
 * For routes that use projectId retrieve the project details
 */
router.param('projectId', function (req, res, next, id) {
    req.projectId = parseInt(id);

    projectDAO.getProjectById(id)
        .then(result => {
            req.project = result[ 0 ];
            next();
        })
        .catch(error => {
            next( error );
        });

});

/**
 * Get a specific project
 */
router.get('/:projectId(\\d+)/', security.isAuthenticated, projectController.displayProjectPage);

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
router.post('/:projectId(\\d+)/risk', security.isAuthenticated, riskController.addProjectRisk);

/**
 * Edit a project report
 */
router.get('/:projectId(\\d+)/report/:reportId(\\d+)', security.isAuthenticated,
    projectController.displayUpdateProjectReportPage);

/**
 * Update the report for a project
 */
router.post('/:projectId(\\d+)/report/:reportId(\\d+)', security.isAuthenticatedEditor,
    projectController.updateProjectReport);

module.exports = router;