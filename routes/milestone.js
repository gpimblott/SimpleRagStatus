'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const milestoneDAO = require('../dao/milestoneDAO');

const projectController = require("../controllers/projectController");
const milestoneController = require("../controllers/milestoneController");

const projectDAO = require("../dao/projectDAO");

const router = express.Router();
/**
 * These are subroutes from /project/:projectid/milestone
 */

/**
 * Intercept reportId parameter and set in request
 */
router.param('milestoneId', function (req, res, next, id) {
    req.milestoneId = parseInt(id);

    if (req.method === 'GET') {
        milestoneDAO.getMilestoneById(id)
            .then(result => {
                req.milestone = result[ 0 ];
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
 * Display the 'add new milestone to a project' page
 */
router.get('/', security.isAuthenticatedEditorWithAction, (req, res, next) => {

    if (req.action === 'add') {
        milestoneController.displayAddMilestonePage(req, res, next);
    } else {
        milestoneController.displayMilestonesForProject(req, res, next);
    }
});

router.get('/:milestoneId', security.isAuthenticatedEditorWithAction, (req, res, next) => {
    if (req.action === 'edit') {
        milestoneController.displayEditMilestonePage(req, res, next);
    } else {
        throw(new Error("Not implemented yet"));
    }
});

/**
 * Update an existing milestone
 */
router.post('/:milestoneId', security.isAuthenticatedEditor,  milestoneController.updateMilestone);

/**
 * Add a new milestone for a project
 */
router.post('/', security.isAuthenticatedEditor, milestoneController.addMilestoneToProject);

/**
 * Delete an existing milestone
 */
router.delete('/:milestoneId', security.isAuthenticatedEditorWithAction, milestoneController.deleteMilestone);

module.exports = router;
