const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const Account = function () {
};

Account.getAllAccounts = function () {
    return database.query(
            `SELECT acc.*, r.name as role_name
             from account acc
                      JOIN role r on acc.role_id = r.id`,
        [])
};

Account.getAllRoles = function () {
    return database.query(`SELECT *
                           FROM role
                           ORDER BY id asc`, []
    )
}

Account.addAccount = function (account) {
    let passwordHash = require('crypto').createHash('sha256').update(account.password).digest('base64');

    return database.insertOrUpdate(
            `INSERT INTO account (username, firstname, surname, role_id, email, password, enabled)
             VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [account.username, account.firstname, account.surname, account.role, account.email, passwordHash]);
}

Account.deleteAccountById = function( accountId) {
    return database.deleteByIds( 'account', [accountId]);
}

module.exports = Account;