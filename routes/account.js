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

router.get("/add", security.isAuthenticatedAdmin, (req, res) => {
    accountDao.getAllRoles().then(roles => {
        res.render('admin/addAccount',
            {
                roles: roles,
                layout: "main"
            });
    });
});

router.get("/:id(\\d+)/password", security.isAuthenticatedAdmin, (req, res) => {
    let accountId = parseInt(req.params.id);
    accountDao.getAccountById(accountId)
        .then( account=>{
            res.render('admin/changePassword', {
                account: account[0]
            });
        } )

});

router.post('/', security.isAuthenticatedAdmin, (req, res) => {

    logger.info("Adding new account %s", req.body.username);
    accountDao.addAccount(req.body)
        .then(result => {
            res.redirect('/account/');
        })
        .catch(error => {
            logger.error("Error creating acount: %s", error);
            res.render('error',
                {
                    message: "Error creating account",
                    error: error
                });
        })
});

/**
 * Update a users password
 */
router.post('/:id(\\d+)/password', security.isAuthenticatedAdmin, (req, res) => {
    let accountId = parseInt(req.params.id);
    logger.info("Updating password %s", accountId);

    console.log(req.body);

    if( req.body.password1 != req.body.password2) {
        logger.info("New passwords are different");
        res.redirect('/account');
        return;
    }

    accountDao.updatePassword( accountId , req.body.currentPassword, req.body.password2)
        .then( result => {
            logger.info("Password for account $s updated" , accountId);
            res.redirect('/account');
        })
        .catch( error => {
            logger.error("Error creating acount: %s", error);
            res.render('error',
                {
                    message: "Failed to change password",
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