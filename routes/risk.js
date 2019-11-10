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
 * Show the edit risk page
 */
router.get('/:riskId(\\d+)', security.isAuthenticated, (req, res, next) => {
    riskController.editRiskPage(req, res, next);
});

/**
 * Update a new Risk
 */
router.post('/:riskId(\\d+)', security.isAuthenticatedEditor, riskController.updateRisk);

module.exports = router;
