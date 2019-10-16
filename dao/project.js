const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const Project = function () {
};

Project.getById = function (id) {
    return database.query( "SELECT * from project where id = $1", [id])
};


module.exports = Project;