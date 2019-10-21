require('dotenv').config({ path: 'process.env', silent: false });

const database = require('../database/dbConnection.js');
const User = require('../models/User');

const bcrypt = require('bcrypt');

const defaultPassword = process.env.DEFAULT_PASSWORD || 'password';

/**
 * First setup the required roles
 */


const accounts = [
    { username: 'admin', role: 'Admin', firstName: 'admin', surname: 'admin', email: 'admin@dummy.com' },
    { username: 'gordon', role: 'Admin', firstName: 'Gordon', surname: 'Pimblott', email: 'gordon@dummy.com' },
    { username: 'guest', role: 'User', firstName: 'Test', surname: 'Guest', email: 'guest@dummy.com' },
    { username: 'editor', role: 'Editor', firstName: 'Test', surname: 'Editor', email: 'editor@dummy.com' }
];

accounts.forEach(item => {

    findRoleId(item.role).then(
        result => {
            if (result !== undefined && result.length > 0) {

                bcrypt.hash( defaultPassword , 10 , (err, hash)=> {
                    let user = new User(
                        item.username,
                        item.firstName,
                        item.surname,
                        result[ 0 ].id,
                        item.email,
                        'true');

                    insertAccount(user, hash);
                })
            }
        },
        error => {
            console.log("Couldn't find Role: " + item.role);
        })
});

/**
 * Now setup some user accounts
 */
function findRoleId (roleName) {
    console.log('Finding Role : %s', roleName);
    return database.query("Select id from role where name=$1", [roleName]);
}

function insertAccount (user, password) {
    database.insertOrUpdate(
            `INSERT INTO account(firstname, surname, username, email, role_id, password, enabled)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             on CONFLICT DO NOTHING`,
        [user.firstname, user.surname, user.username, user.email, user.role_id, password, user.enabled])
        .then(
            (result) => {
                console.log("Inserted Account: " + result);
            },
            (error) => {
                console.log("Error inserting account: " + error);
            });
}



