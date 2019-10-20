const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const Account = function () {
};

Account.getAllAccounts = function () {
    return database.query(
        `SELECT acc.*, r.name as role_name from account acc
                JOIN role r on acc.role_id = r.id`,
        [])
};


module.exports = Account;