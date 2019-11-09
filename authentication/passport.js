'use strict';

const logger = require('../winstonLogger')(module);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const bcrypt = require('bcrypt');

const User = require('../models/User.js');
const users = require('../dao/usersDAO.js');

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    users.findById(id, function (err, user) {
        if (err) {
            logger.info("deserialize failed");
            return cb(err);
        }
        cb(null, user);
    });
});

// Implement the local strategy
passport.use(new LocalStrategy(
    function (username, password, cb) {
        users.findByUsername(username, function (err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false, {message: 'Incorrect login'});
            }

            if (!user.enabled) {
                return cb(null, false, {
                    message: `Account disabled. 
                        Please contact the platform administrator to activate this account.`
                });
            }

            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    return cb(null, user);
                } else {
                    logger.warn("Login failure due to password");
                    return cb(null, false, {message: 'Incorrect login'});
                }
            });

        });
    }));