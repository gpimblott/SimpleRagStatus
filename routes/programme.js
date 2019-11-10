'use strict';

const express = require('express');
const security = require('../authentication/security');
const router = express.Router();

const projectDao = require('../dao/projectDAO');
const riskDao = require("../dao/riskDAO");

router.get('/', security.isAuthenticated, (req, res, next) => {
    res.redirect('/programme/dashboard');
});

/**
 * High level overview of all projects and their current phase
 */
router.get('/dashboard', security.isAuthenticated, (req, res, next) => {

    let promises = [];
    promises.push(projectDao.getAllProjects());
    promises.push(projectDao.getPhaseCounts());

    Promise.all(promises)
        .then(results => {

            let projectArray = results[0];
            let countsArray = results[1];
            let counts = {};
            let data = {};

            countsArray.forEach(item => {
                counts[item.phase_name] = item.phase_count;
            });

            projectArray.forEach(item => {

                if (data.hasOwnProperty(item.group_name)) {
                    data[item.group_name][item.phase_name].push(item);
                } else {
                    data[item.group_name] = {Prep: [], Discovery: [], Alpha: [], Beta: [], Live: []};
                    data[item.group_name][item.phase_name].push(item);
                }
            });

            res.render('programme', {
                layout: 'programme',
                projects: data,
                counts: counts
            });
        })
        .catch(error => {
            next(error);
        })

});


/**
 * Display all of the defined risks
 */
router.get('/risks', security.isAuthenticated, (req, res, next) => {

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