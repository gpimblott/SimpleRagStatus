'use strict';

const logger = require('../winstonLogger')(module);

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
        req.session.redirect_to = req.originalUrl;
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

    req.session.redirect_to = req.originalUrl;
    res.redirect('/auth/login');
}

/**
 * Check if the user is an editor
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
Security.isAuthenticatedEditor = function (req, res, next) {
    if (req.isAuthenticated() && req.user.editor) {
        return next();
    }

    req.session.redirect_to = req.originalUrl;
    res.redirect('/auth/login');
}

module.exports = Security;