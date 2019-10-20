const logger = require('../winstonLogger')(module);
const express = require('express');

const security = require('../authentication/security');
const reportDao = require("../dao/report");

const router = express.Router();

/**
 * The default page - currently just redirects to the latest report
 */
router.get('/', security.isAuthenticated, (req, res) => {
    const url = req.session.redirect_to;
    if (url !== undefined) {
        delete req.session.redirect_to;
        res.redirect(url);
    } else {
        reportDao.getMostRecent()
            .then(result => {
                if(result.length!==1) {
                    throw("No Reports found");
                }
                res.redirect('/report/' + result[ 0 ].id)
            })
            .catch( error => {
                logger.error("Failed to get main index page: %s", error);
                res.render('error',
                    {
                        message: error.message,
                        error: error
                    });
            })
    }
});


module.exports = router;
