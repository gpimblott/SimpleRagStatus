const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const bcrypt = require('bcrypt');

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

Account.getAccountById = function (accountId) {
    return database.query(
            `SELECT *
             FROM account
             where id = $1`, [accountId]
    );
}

Account.addAccount = function (account) {

    return bcrypt.hash(account.password, 10)
        .then((hash) => {
            return database.insertOrUpdate(
                    `INSERT INTO account (username, firstname, surname, role_id, email, password, enabled)
                     VALUES ($1, $2, $3, $4, $5, $6, true)`,
                [account.username, account.firstname, account.surname, account.role, account.email, hash]);
        });
}

/**
 *
 * @param accountId
 * @param currentPassword
 * @param newPassword
 * @returns {Promise<unknown>}
 */
Account.updatePassword = function (accountId, currentPassword, newPassword) {
    let oldHash = undefined;

    return database.query("select password from account where id=$1", [accountId])
        .then( result=>{
            return bcrypt.compare( currentPassword , result[0].password);
        })
        .then( match=>{
            if (match) {
                return bcrypt.hash(newPassword, 10);
            } else {
                throw ("Old password doesn't match ");
            }
        })
        .then ( hash=>{
            return database.insertOrUpdate(
                "UPDATE account set password=$1 WHERE id = $2",
                [hash, accountId])
        });
};

Account.deleteAccountById = function (accountId) {
    return database.deleteByIds('account', [accountId]);
}

module.exports = Account;