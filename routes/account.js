'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const accountDao = require("../dao/account");

const router = express.Router();

/**
 * Return all of the defined reports
 */
router.get('/', security.isAuthenticatedAdmin, (req, res) => {

    accountDao.getAllAccounts()
        .then(accounts => {
            res.render('admin/account',
                {
                    layout: "main",
                    accounts: accounts
                });
        })
        .catch(error => {
            logger.error("Failed to get all accounts: %s", error);
            res.render('error',
                {
                    message: "Failed to get all accounts",
                    error: error
                });
        });
    ;
});

module.exports = router;