'use strict';

const express = require('express');
const security = require('../authentication/security');
const router = express.Router();

const accountController = require('../controllers/accountController');

/**
 * If the route has an 'accountId' parameter then extract it
 */
router.param('accountId', function (req, res, next, id) {
    req.accountId = parseInt(id);
    next();
});

/**
 * Display all of the accounts or the 'add' account page if the
 * action parameter is defined
 *
 * GET /account/
 */
router.get('/', security.isAuthenticatedAdmin, (req, res, next) => {
    let action = (req.query.action || "view").toLowerCase();

    if (action === 'add') {
        accountController.addAccountPage(req, res, next);
    } else {
        accountController.listAllAccounts(req, res, next);
    }
});

/**
 * Edit the specified account account
 */
router.get("/:accountId(\\d+)", security.isAuthenticatedAdmin, accountController.editAccountPage );

/**
 * Display the change password page for a specified account ID
 *
 * GET /account/{account_id}/password
 */
router.get("/:accountId(\\d+)/password", security.isAuthenticatedAdmin, accountController.changePasswordPage);

/**
 * Posing to /account adds a new account then redirects to the account list page
 *
 * POST /account/
 */
router.post('/', security.isAuthenticatedAdmin, accountController.addAccount);
router.post('/:accountId(\\d+)', security.isAuthenticatedAdmin, accountController.updateAccount);

/**
 * Update the specified users password - if successful redirect to the account list
 * This only requires the new password to be specified
 *
 * POST /account/{account_id}/password
 */
router.post('/:accountId(\\d+)/password', security.isAuthenticatedAdmin, accountController.updatePassword);

/**
 * Delete a user account
 *
 * DEL /account/{account_id}/
 */
router.delete('/:accountId(\\d+)/', security.isAuthenticatedAdmin, accountController.deleteAccount);


module.exports = router;