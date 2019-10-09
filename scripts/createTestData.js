require('dotenv').config({ path: 'process.env', silent: false });

const database = require('../database/dbConnection.js');
const User = require('../models/User');

const defaultPassword = 'password';

/**
 * First setup the required roles
 */
const roles = [
    { name: 'Admin', is_admin: 'true' },
    { name: 'Author', is_admin: 'false' },
    { name: 'User', is_admin: 'false' }
];

const accounts = [
    { username: 'admin', role: 'Admin', firstName: 'admin', surname: 'admin', email: 'dummy@dummy.com' },
    { username: 'gordon', role: 'Admin', firstName: 'Gordon', surname: 'Pimblott', email: 'gordon@dummy.com' },
    { username: 'delivery', role: 'Author', firstName: 'Test', surname: 'Test', email: 'designer@dummy.com' },
    { username: 'guest', role: 'User', firstName: 'Test', surname: 'Test', email: 'paul@dummy.com' }
];


let promises = [];
// Create the roles
roles.forEach((item => {
    promises.push(insertRole(item.name, item.is_admin));
}));

// Wait for the roles to be inserted
Promise.all( promises ).then ( (values)=> {
    // Create the accounts
    accounts.forEach(item => {

        findRoleId(item.role).then(
            result => {
                if (result !== undefined && result.length > 0) {
                    let passwordHash = require('crypto').createHash('sha256').update(defaultPassword).digest('base64');
                    let user = new User(
                        item.username,
                        item.firstName,
                        item.surname,
                        result[0].id,
                        item.email,
                        'true');

                    insertAccount(user, passwordHash);
                }
            },
            error => {
                console.log("Couldn't find Role: " + item.role);
            })
    });
});




/**
 * Now setup some user accounts
 */
function findRoleId (roleName) {
    console.log('Finding Role : %s', roleName);
    return database.query("Select id from role where name=$1", [roleName]);
}

function insertRole (name, is_admin) {
    return database.insertOrUpdate(
        "INSERT INTO role( name, is_admin ) VALUES ($1, $2) on CONFLICT DO NOTHING",
        [name, is_admin]);
}

function insertAccount (user, password) {
    database.insertOrUpdate(
        "INSERT INTO account( firstname, surname, username, email, role_id, password, enabled ) " +
        "VALUES ($1, $2, $3, $4, $5, $6, $7) on CONFLICT DO NOTHING",
        [user.firstname, user.surname, user.username, user.email, user.role_id, password, user.enabled])
        .then(
            (result) => {
                console.log("Inserted Account: " + result);
            },
            (error) => {
                console.log("Error inserting account: " + error);
            });
}



