'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');
const riskDao = require("../dao/riskDAO");

const riskController = require("../controllers/riskController");

const router = express.Router();

/**
 * For routes that use projectId retrieve the project details
 */
router.param('riskId', function (req, res, next, id) {
    req.riskId = parseInt(id);

    riskDao.getRiskById(id)
        .then(result => {
            req.risk = result[ 0 ];
            next();
        })
        .catch(error => {
            next(error);
        });
});

/**
 * Display risk page or page to add a new risk if the action parameter is set
 */
router.get('/', security.isAuthenticatedEditorWithAction, (req, res, next) => {

    if (req.action === 'add') {
        riskController.displayAddRiskPage(req, res, next);
    } else {
        riskController.displayRisksForProjectPage(req, res, next);
    }
});

/**
 * Add a new risk for a project
 */
router.post('/', security.isAuthenticatedEditor, riskController.addProjectRisk);

/**
 * Display the edit page
 */
router.get('/:riskId(\\d+)', security.isAuthenticatedEditorWithAction, (req, res, next) => {
    if (req.action === 'edit') {
        riskController.editRiskPage(req, res, next);
    } else {
        throw(new Error('Not yet implemented'));
    }
});

/**
 * Update a Risk
 */
router.post('/:riskId(\\d+)', security.isAuthenticatedEditor, riskController.updateRisk);


module.exports = router;
