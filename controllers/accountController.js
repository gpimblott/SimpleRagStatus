'use strict';

let owasp = require('owasp-password-strength-test');

// Pass a hash of settings to the `config` method. The settings shown here are
// the defaults.
owasp.config({
    allowPassphrases: true,
    maxLength: 128,
    minLength: 8,
    minPhraseLength: 15,
    minOptionalTestsToPass: 4,
});

const logger = require('../winstonLogger')(module);

const accountDao = require("../dao/accountDAO");

/**
 * Update an account password (after doing some checks)
 * @param req
 * @param res
 * @param next
 */
exports.updatePassword = function (req, res, next) {
    let accountId = req.accountId;

    logger.info("Updating password %s", accountId);

    if (req.body.password1 != req.body.password2) {
        logger.info("New passwords are different");
        res.redirect('/account');
        return;
    }


    // invoke test() to test the strength of a password
    let result = owasp.test(req.body.password1);

    if (result.errors.length !== 0) {
        logger.info(result.errors);
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
            next(error);
        });
}

/**
 * Update the currently logged in user password
 * It expects the current password to be provided
 * @param req
 * @param res
 * @param next
 */
exports.updateMyPassword = function (req, res, next) {
    let theUser = req.user;

    if (req.body.password1 !== req.body.password2) {
        logger.info("New passwords are different");
        res.render('admin/changeMyPassword', {
            message: "New passwords are different"
        });
        return;
    }

    // invoke test() to test the strength of a password
    let result = owasp.test(req.body.password1);

    if (result.errors.length !== 0) {
        logger.info(result.errors);

        let errors="";
        result.errors.forEach((error) => {
            errors += error + "<br />";
        });

        res.render('admin/changeMyPassword', {
            message: errors
        });

        return;
    }

    accountDao.updatePasswordWithOldPasswordCheck(theUser.id, req.body.currentPassword, req.body.password2)
        .then(result => {
            if (result.rowCount !== 1) {
                throw("Password not updated");
            }

            logger.info("Password for account %s updated", theUser.id);
            res.redirect('/');
        })
        .catch(error => {
            logger.error("Error updating password: %s", error);
            res.render('admin/changeMyPassword', {
                message: "Please check current password"
            });
        });
}

/**
 * Show all of the accounts
 * @param req
 * @param res
 * @param next
 */
exports.listAllAccounts = function (req, res, next) {
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
            next(error);
        });
};

/**
 * Display the add account page
 * @param req
 * @param res
 * @param next
 */
exports.addAccountPage = function (req, res, next) {
    accountDao.getAllRoles().then(roles => {
        res.render('admin/addAccount',
            {
                roles: roles,
                layout: "main"
            })
    });
};

/**
 * Display the edit account page
 * @param req
 * @param res
 * @param next
 */
exports.editAccountPage = function (req, res, next) {
    let accountId = req.accountId;

    let promises = [];
    promises.push(accountDao.getAccountById(accountId));
    promises.push(accountDao.getAllRoles());

    Promise.all(promises)
        .then(results => {
            let account = results[0][0];
            let roles = results[1];

            res.render('admin/editAccount',
                {
                    account: account,
                    roles: roles
                });
        })
        .catch(error => {
            logger.error("Failed to display edit account page: %s", error);
            next(error);
        });
};

/**
 * Display the change password page
 * @param req
 * @param res
 * @param next
 */
exports.changePasswordPage = function (req, res, next) {

    accountDao.getAccountById(req.accountId)
        .then(account => {
            res.render('admin/changePassword', {
                account: account[0]
            });
        })
        .catch(error => {
            logger.error("Failed to change password %s", error);
            next(error);
        });
};


/**
 * Add a new account
 * @param req
 * @param res
 * @param next
 */
exports.addAccount = function (req, res, next) {
    logger.info("Adding new account %s", req.body.username);

    accountDao.addAccount(req.body)
        .then(result => {
            res.redirect('/account/');
        })
        .catch(error => {
            logger.error("Error creating account: %s", error);
            next(error);
        })
};

/**
 * Update the details for an account
 * @param req
 * @param res
 * @param next
 */
exports.updateAccount = function (req, res, next) {
    let accountId = req.accountId;
    logger.info("Updating account %s", req.body.username);

    let account = {
        username: req.body.username,
        firstname: req.body.firstname,
        surname: req.body.surname,
        role: req.body.role,
        email: req.body.email
    };

    accountDao.updateAccount(accountId, account)
        .then(result => {
            res.redirect('/');
        })
        .catch(error => {
            logger.error("Error updating account: %s", error);
            next(error);
        })
};

/**
 * Delete an existing account
 * @param req
 * @param res
 */
exports.deleteAccount = function (req, res, next) {
    let accountId = req.accountId;

    logger.info("DELETE user %s", accountId);

    accountDao.deleteAccountById(accountId)
        .then(result => {
            res.sendStatus(200);
        })
        .catch(error => {
            logger.error("Error deleting account: %s", error);
            next(error);
        });
};