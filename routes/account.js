'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const accountDao = require("../dao/accountDAO");

const router = express.Router();

/**
 * Display the page of add accounts
 * Admin only
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
});

/**
 * Display the add account page
 * Admin only
 */
router.get("/add", security.isAuthenticatedAdmin, (req, res) => {
    accountDao.getAllRoles().then(roles => {
        res.render('admin/addAccount',
            {
                roles: roles,
                layout: "main"
            });
    });
});

/**
 * Display the change password page for a specified account ID
 * Admin only
 */
router.get("/:id(\\d+)/password", security.isAuthenticatedAdmin, (req, res) => {
    let accountId = parseInt(req.params.id);
    accountDao.getAccountById(accountId)
        .then(account => {
            res.render('admin/changePassword', {
                account: account[ 0 ]
            });
        })

});

/**
 * Posing to /account adds a new account then redirects to the account list page
 */
router.post('/', security.isAuthenticatedAdmin, (req, res) => {

    logger.info("Adding new account %s", req.body.username);
    accountDao.addAccount(req.body)
        .then(result => {
            res.redirect('/account/');
        })
        .catch(error => {
            logger.error("Error creating account: %s", error);
            res.render('error',
                {
                    message: "Error creating account",
                    error: error
                });
        })
});

/**
 * Update the specified users password - if successful redirect to the account list
 * This only requires the new passsord to be specified
 * Admin only
 */
router.post('/:id(\\d+)/password', security.isAuthenticatedAdmin, (req, res) => {
    let accountId = parseInt(req.params.id);
    logger.info("Updating password %s", accountId);

    if (req.body.password1 != req.body.password2) {
        logger.info("New passwords are different");
        res.redirect('/account');
        return;
    }

    accountDao.updatePassword(accountId, req.body.password2)
        .then(result => {
            if(result.rowCount!==1) {
                throw("Password not updated");
            }

            logger.info("Password for account %s updated", accountId);
            res.redirect('/account');
        })
        .catch(error => {
            logger.error("Error updating password: %s", error);
            res.render('error',
                {
                    message: "Failed to update password",
                    error: error
                });
        });

});

/**
 * Delete a user account
 */
router.delete('/:id(\\d+)/', security.isAuthenticatedAdmin, (req, res) => {
    let accountId = parseInt(req.params.id);
    logger.info("DELETE user %s", accountId);

    accountDao.deleteAccountById(accountId)
        .then(result => {
            res.sendStatus(200);
        });

});

module.exports = router;