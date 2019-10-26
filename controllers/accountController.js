'use strict';

const logger = require('../winstonLogger')(module);

const accountDao = require("../dao/accountDAO");

/**
 * Update an account password (after doing some checks)
 * @param req
 * @param res
 */
exports.updatePassword = function (req, res) {
    let accountId = req.accountId;

    logger.info("Updating password %s", accountId);

    if (req.body.password1 != req.body.password2) {
        logger.info("New passwords are different");
        res.redirect('/account');
        return;
    }

    accountDao.updatePassword(accountId, req.body.password2)
        .then(result => {
            if (result.rowCount !== 1) {
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
}

/**
 * Show all of the accounts
 * @param req
 * @param res
 */
exports.listAllAccounts = function (req, res) {
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
};

/**
 * Display the add account page
 * @param req
 * @param res
 */
exports.addAccountPage = function (req, res) {
    accountDao.getAllRoles().then(roles => {
        res.render('admin/addAccount',
            {
                roles: roles,
                layout: "main"
            })
            .catch(error => {
                logger.error("Failed to display add account page: %s", error);
                res.render('error',
                    {
                        message: "Failed to display add account page",
                        error: error
                    });
            });
    });
};

/**
 * Display the edit account page
 * @param req
 * @param res
 */
exports.editAccountPage = function (req, res) {
    let accountId = req.accountId;

    let promises = [];
    promises.push(accountDao.getAccountById(accountId));
    promises.push(accountDao.getAllRoles());

    Promise.all(promises)
        .then(results => {
            let account = results[ 0 ][ 0 ];
            let roles = results[ 1 ];

            res.render('admin/editAccount',
                {
                    account: account,
                    roles: roles
                });
        })
        .catch(error => {
            logger.error("Failed to display edit account page: %s", error);
            res.render('error',
                {
                    message: "Failed to display edit account page",
                    error: error
                });
        });
};

/**
 * Display the change password page
 * @param req
 * @param res
 */
exports.changePasswordPage = function (req, res) {
    let accountId = req.accountId;
    accountDao.getAccountById(accountId)
        .then(account => {
            res.render('admin/changePassword', {
                account: account[ 0 ]
            });
        })
}

/**
 * Add a new account
 * @param req
 * @param res
 */
exports.addAccount = function (req, res) {
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
}

exports.updateAccount = function (req, res) {
    let accountId = req.accountId;
    logger.info("Updating account %s", req.body.username);

    accountDao.updateAccount(accountId, req.body)
        .then(result => {
            res.redirect('/account/');
        })
        .catch(error => {
            logger.error("Error updating account: %s", error);
            res.render('error',
                {
                    message: "Error creating account",
                    error: error
                });
        })
}


/**
 * Delete an existing account
 * @param req
 * @param res
 */
exports.deleteAccount = function (req, res) {
    let accountId = req.accountId;

    logger.info("DELETE user %s", accountId);

    accountDao.deleteAccountById(accountId)
        .then(result => {
            res.sendStatus(200);
        });
}