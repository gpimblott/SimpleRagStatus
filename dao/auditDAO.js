'use strict';

const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const AuditDAO = function () {
};

/**
 * Write an audit entry
 * @returns {Promise | Promise<unknown>}
 */
AuditDAO.write = function (username, message) {
    return database.insertOrUpdate(
        'INSERT INTO audit (username, message) VALUES ($1, $2)',
        [username, message]
    )
};

module.exports = AuditDAO;