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
        .then( risks => {
            res.render('listAllRisks',
                {
                    risks: risks,
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


module.exports = router;
