'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const router = express.Router();

const reportController = require('../controllers/reportController');
const projectController = require("../controllers/projectController");

/**
 * Intercept reportId parameter and set in request
 */
router.param('statusId', function (req, res, next, id) {
    req.reportId = parseInt(id);
    next();
});

/**
 * Display the update page for a project status
 */
router.get('/:statusId(\\d+)', security.isAuthenticatedEditor,
    projectController.displayUpdateProjectReportPage);

/**
 * Update the status for a project
 */
router.post('/:statusId(\\d+)', security.isAuthenticatedEditor,
    projectController.updateProjectReport);

module.exports = router;