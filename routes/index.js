const logger = require('../winstonLogger')(module);
const express = require('express');

const security = require('../authentication/security');
const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");

const router = express.Router();

/**
 * The default page - currently just redirects to the latest report
 */
router.get('/', security.isAuthenticated, (req, res, next) => {
    const url = req.session.redirect_to;
    if (url !== undefined) {
        delete req.session.redirect_to;
        res.redirect(url);
    } else {
        let latestReport;
        let lastFiveReports;
        reportDao.getMostRecent(5)
            .then( results => {
                lastFiveReports = results;
                latestReport = results[0];
                return projectStatusDao.getStatusReportByReportId( latestReport.id );
            })
            .then( reports => {

                let scopeTotals = { red: 0, amber: 0, green: 0 };
                let scheduleTotals = { red: 0, amber: 0, green: 0 };
                let riskTotals = { red: 0, amber: 0, green: 0 };
                let benefitTotals = { red: 0, amber: 0, green: 0 };

                reports.forEach(item => {
                    countColours(scopeTotals, item.scope);
                    countColours(scheduleTotals, item.schedule);
                    countColours(riskTotals, item.risk);
                    countColours(benefitTotals, item.benefits);
                });

                res.render ( 'home', {
                    reports: lastFiveReports,
                    latestReport: latestReport,
                    scopeTotals: scopeTotals,
                    scheduleTotals: scheduleTotals,
                    riskTotals: riskTotals,
                    benefitTotals: benefitTotals
                })
            })
            .catch(error => {
                logger.error(error);
                next(error);
            })
    }
});

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
