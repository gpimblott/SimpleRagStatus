'use strict';

const logger = require('../winstonLogger')(module);
const User = require('../models/User');

const pg = require('pg');
const database = require('../database/dbConnection.js');

// This is an example implementation - you would normally store users in the DB
const Users = function () {
};

/**
 * Get a user by ID
 * @param id ID of the user to get
 * @param done Function to call with the result
 */
Users.findById = function (id, done) {
    logger.info("Find by ID : %s", id);
    const sql = "SELECT *  FROM account where id=$1 ";

    database.query(sql, [id])
        .then(
            (results) => {
                if (results === null || results.length === 0) {
                    return done(null, null);
                }

                const user = User.recordToUser(results[ 0 ]);
                return done(null, user);
            },
            (error) => {
                logger.error(error);
                return done(null, null);
            });
};

/**
 * Add a new user
 * @param username Username of the user to search for
 * @param done Function to call with the result
 */
Users.addUser = function (user, password, done) {
    database.insertOrUpdate(
        "INSERT INTO account( firstname, surname, username, email, role_id, password, enabled ) " +
        "VALUES ($1, $2, $3, $4, $5, $6, $7) on CONFLICT DO NOTHING",
        [user.firstname, user.surname, user.username, user.email, user.role_id, password, user.enabled])
        .then(
            (result) => {
                logger.info("Inserted Account: %s", result);
                done(null);
            },
            (error) => {
                logger.error("Error inserting account: %s", error);
                done(error);
            });
}

/**
 * Given a username find it in the DB
 * @param username
 * @param done
 */
Users.findByUsername = function (username, done) {
    logger.info("Find by username : %s", username);
    const sql = "SELECT * FROM account where username=$1 ";

    database.query(sql, [username])
        .then(
            (results) => {

                if (results === null || results.length === 0) {
                    return done(null, null);
                }

                const user = User.recordToUser(results[ 0 ]);
                logger.info("Found user %s", username);
                return done(null, user);
            },
            (error) => {
                logger.error(error);
                return done(null, null);
            });
};

/**
 * Internal function to map DB record to user object
 * @param record
 * @returns {User|*}
 */
User.recordToUser = function (record) {
    const user = new User();
    user.id = record.id;
    user.firstname = record.firstname;
    user.surname = record.surname;
    user.username = record.username;
    user.email = record.email;
    user.password = record.password;
    user.role_id = record.role_id;
    user.enabled = record.enabled;

    return user;
}

module.exports = Users;
