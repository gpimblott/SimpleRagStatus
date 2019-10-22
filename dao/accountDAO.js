const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const bcrypt = require('bcrypt');

const AccountDAO = function () {
};

/**
 * Get all of the created accounts
 * @returns {Promise | Promise<unknown>}
 */
AccountDAO.getAllAccounts = function () {
    return database.query(
            `SELECT acc.*, r.name as role_name
             from account acc
                      JOIN role r on acc.role_id = r.id`,
        [])
};

/**
 * Get all of the roles
 * @returns {Promise | Promise<unknown>}
 */
AccountDAO.getAllRoles = function () {
    return database.query(`SELECT *
                           FROM role
                           ORDER BY id asc`, []
    )
}

/**
 * Get a single account by the id
 * @param accountId ID of the account
 * @returns {Promise | Promise<unknown>}
 */
AccountDAO.getAccountById = function (accountId) {
    return database.query(
            `SELECT *
             FROM account
             where id = $1`, [accountId]
    );
}

/**
 * Add a new account - details are specified in a simple object
 * {
 *     username:
 *     firstname:
 *     surname:
 *     role_id:
 *     email:
 *     password:
 *     enabled:
 * }
 * @param account
 * @returns {Promise<unknown>}
 */
AccountDAO.addAccount = function (account) {

    return bcrypt.hash(account.password, 10)
        .then((hash) => {
            return database.insertOrUpdate(
                    `INSERT INTO account (username, firstname, surname, role_id, email, password, enabled)
                     VALUES ($1, $2, $3, $4, $5, $6, true)`,
                [account.username, account.firstname, account.surname, account.role, account.email, hash]);
        });
}

/**
 * Update the password for the specified account.
 * This method requires that the previous password is passed (and correct), along with the new password
 *
 * On error this method will throw an exception
 *
 * @param accountId ID of the account
 * @param currentPassword The current password of the account
 * @param newPassword The new password to set
 * @returns {Promise<unknown>}
 */
AccountDAO.updatePasswordWithOldPasswordCheck = function (accountId, currentPassword, newPassword) {
    let oldHash = undefined;

    return database.query("select password from account where id=$1", [accountId])
        .then(result => {
            return bcrypt.compare(currentPassword, result[ 0 ].password);
        })
        .then(match => {
            if (match) {
                return this.updatePassword( newPassword );
            } else {
                throw ("Old password doesn't match ");
            }
        });
};

/**
 * Update the password for the specified account.
 * This method does NOT require the old password to be entered
 *
 * On error this method will throw an exception
 *
 * @param accountId ID of the account
 * @param newPassword The new password to set
 * @returns {Promise<unknown>}
 */
AccountDAO.updatePassword = function (accountId, newPassword) {

    return bcrypt.hash(newPassword, 10)
        .then(hash => {
            return database.insertOrUpdate(
                "UPDATE account set password=$1 WHERE id = $2",
                [hash, accountId])
        });
};


/**
 * Delete the account with the specified ID
 * @param accountId
 * @returns {Promise | Promise<unknown>}
 */
AccountDAO.deleteAccountById = function (accountId) {
    return database.deleteByIds('account', [accountId]);
}

module.exports = AccountDAO;