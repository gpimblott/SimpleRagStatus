'use strict';

const logger = require('../winstonLogger')(module);
const User = require('../models/User');

const database = require('../database/dbConnection.js');

const UsersDAO = function () {
};

/**
 * Get a user by ID
 * @param id ID of the user to getProjectById
 * @param done Function to call with the result
 */
UsersDAO.findById = function (id, done) {
    const sql =`SELECT acc.*,r.is_admin, r.is_editor FROM account acc
                 JOIN role r on acc.role_id = r.id
                 WHERE acc.id=$1;`

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
 * @param user Definition of the user being added
 * @param password The password for the new user
 * @param done Function to call with the result
 */
UsersDAO.addUser = function (user, password, done) {
    database.insertOrUpdate(
        `INSERT INTO account( firstname, surname, username, email, role_id, password, enabled ) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) on CONFLICT DO NOTHING`,
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
UsersDAO.findByUsername = function (username, done) {
    logger.info("Find by username : %s", username);
    const sql = `SELECT acc.*,r.is_admin, r.is_editor FROM account acc
                 JOIN role r on acc.role_id = r.id
                 WHERE username=$1 `;

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
    user.admin = record.is_admin;
    user.editor = record.is_editor;

    return user;
}

module.exports = UsersDAO;
