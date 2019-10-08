'use strict';

const debug = require('debug')('example:security');
/**
 * Security helper functions
 */
const Security = function () {
};


/**
 * Check if the users is authenticated
 *
 * If not the target url is stored in the session and the user is redirected to the login page
 *
 */
Security.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.session.redirect_to = req.url;
        res.redirect('/auth/login');
    }
}

/**
 * Check if the users is an authenticated admin
 *
 * If not the target url is stored in the session and the user is redirected to the login page
 */
Security.isAuthenticatedAdmin = function (req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        return next();
    }

    req.session.redirect_to = req.url;
    res.redirect('/auth/login');
}



module.exports = Security;