'use strict';
const logger = require('../winstonLogger')(module);

const express = require('express');
const router = express.Router();
const passport = require('passport');

/**
 * Display the login page if the user is not logged in
 */
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('login', { layout: 'login-page' });
    }
});

/**
 * Receive the POST  login request
 */
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: false
}));

/**
 * Logout the current
 */
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/auth/login');
});

module.exports = router;
