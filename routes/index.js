const logger = require('../winstonLogger')(module);
const express = require('express');
const multer = require('multer');

const security = require('../authentication/security');
const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");

const accountController = require("../controllers/accountController");
const accountDao = require("../dao/accountDAO");

const upload = multer({ dest: 'tmp/csv/' });
const csv = require('fast-csv');

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
            .then(results => {
                lastFiveReports = results;
                latestReport = results[ 0 ];
                return projectStatusDao.getStatusReportByReportId(latestReport.id);
            })
            .then(reports => {

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

                res.render('home', {
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

/**
 * Change the local users password
 */
router.get('/changeMyPassword', security.isAuthenticated, (req, res, next) => {
    res.render('admin/changeMyPassword', {});
});

router.post('/changeMyPassword', security.isAuthenticated, (req, res, next) => {
    accountController.updateMyPassword(req, res, next);
});

/**
 * Upload a CSV of user accounts
 */
router.get('/upload-account-csv' , security.isAuthenticatedAdmin, (req, res, next) => {
    res.render('admin/uploadAccountFile', {});
});

router.post('/upload-account-csv', security.isAuthenticatedAdmin, upload.single('csvfile'), (req, res, next) => {
    let password='';
    csv
        .parseFile(req.file.path)
        .on('error', error => console.error(error))
        .on('data', row => {

            if( row[0]==="Password") {
                password=row[1];
                console.log("Found password:" + password);
            } else {
                accountDao.lookupRole(row[ 2 ])
                    .then(result => {
                        let username = (String(row[ 0 ]).charAt(0) + row[ 1 ]).toLowerCase();
                        let account = {
                            username: username,
                            role: result[ 0 ].id,
                            firstname: row[ 0 ],
                            surname: row[ 1 ],
                            email: row[ 3 ],
                            password: password
                        }

                        console.log(account);
                        //accountDao.addAccount(account);
                    })
            }

        })
        .on('end', rowCount => {
            console.log(`Parsed ${rowCount} rows`);
            res.send( `Processed ${rowCount} rows` );
            res.end();
        });

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
