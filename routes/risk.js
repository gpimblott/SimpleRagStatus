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
 * Display all of the defined risks
 */
router.get('/', security.isAuthenticated, (req, res, next) => {

    riskDao.getAllOpenRisks()
        .then(risks => {

            let impactTotals = { red: 0, amber: 0, green: 0 };
            let severityTotals = { red: 0, amber: 0, green: 0 };
            let likelihoodTotals = { red: 0, amber: 0, green: 0 };

            risks.forEach(item => {
                countColours(impactTotals, item.impact);
                countColours(severityTotals, item.severity);
                countColours(likelihoodTotals, item.likelihood);
            });

            res.render('risks/listAllRisks',
                {
                    risks: risks,
                    impactTotals: impactTotals,
                    severityTotals: severityTotals,
                    likelihoodTotals: likelihoodTotals
                });
        })
        .catch(error => {
            logger.error("Failed to get all risks: %s", error);
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

/**
 * Private function to count how many of each colour
 * @param totals Current totals to increment
 * @param item The current item to check
 */
function countColours (totals, item) {
    switch (item) {
        case 'Red' :
            totals.red += 1;
            break;
        case 'Amber' :
            totals.amber += 1;
            break;
        case 'Green' :
            totals.green += 1;
    }
}

module.exports = router;
