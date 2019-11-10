const logger = require('../winstonLogger')(module);
const express = require('express');

const security = require('../authentication/security');
const reportDao = require("../dao/reportDAO");

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
        reportDao.getMostRecent()
            .then(report => {
                // If there is a report defined then display it
                if(report.length===1) {
                    res.redirect('/report/' + report[0].id)
                } else {
                    res.redirect('/report?action=add');
                }
            })
            .catch(error => {
                next(error);
            })
    }
});


module.exports = router;
