'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');
const riskDao = require("../dao/riskDAO");

const router = express.Router();

/**
 * The default page - currently just redirects to the latest report
 */
router.get('/', security.isAuthenticated, (req, res) => {

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

            res.render('listAllRisks',
                {
                    risks: risks,
                    impactTotals: impactTotals,
                    severityTotals: severityTotals,
                    likelihoodTotals: likelihoodTotals
                });
        })
        .catch(error => {
            logger.error("Failed to get all risks: %s", error);
            res.render('error',
                {
                    message: "Error getting all risks",
                    error: error
                });
        });
});

function countColours(totals, item) {
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
