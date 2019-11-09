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
};

/**
 * Check if the users is an authenticated admin
 *
 * If not the target url is stored in the session and the user is redirected to the login page
 */
Security.isAuthenticatedAdmin = function (req, res, next) {
    if (req.isAuthenticated()) {
        if( req.user.admin) {
            return next();
        } else {
            throw(new Error("Not authorised for this operation"));
        }
    } else {
        req.session.redirect_to = req.originalUrl;
        res.redirect('/auth/login');
    }
};

/**
 * Check if the user is an editor
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
Security.isAuthenticatedEditor = function (req, res, next) {
    if (req.isAuthenticated()) {
        if( req.user.editor ) {
            return next();
        }
        else {
            throw(new Error("Not authorised for this operation"));
        }
    } else {
        req.session.redirect_to = req.originalUrl;
        res.redirect('/auth/login');
    }
};

/**
 * Middleware function to check authentication when an ?action='value' parameters
 * is expected on the URL
 * @param request
 * @param response
 * @param next
 */
Security.isAuthenticatedAdminWithAction = function (request, response, next) {
    if (request.query.action) {
        let action = request.query.action.toLowerCase();
        request.action = action;
        if (action === '' || action === 'view' || action ==='download') {
            Security.isAuthenticated(request, response, next);
        } else {
            Security.isAuthenticatedAdmin(request, response, next);
        }
    } else {
        request.action='view';
        Security.isAuthenticated(request, response, next);
    }
};

/**
 * Middleware function to check authentication when an ?action='value' parameters
 * is expected on the URL
 * @param request
 * @param response
 * @param next
 */
Security.isAuthenticatedEditorWithAction = function (request, response, next) {
    if (request.query.action) {
        let action = request.query.action.toLowerCase();
        request.action = action;
        if (action === '' || action === 'view' || action ==='download') {
            Security.isAuthenticated(request, response, next);
        } else {
            Security.isAuthenticatedEditor(request, response, next);
        }
    } else {
        request.action='view';
        Security.isAuthenticated(request, response, next);
    }
};

module.exports = Security;