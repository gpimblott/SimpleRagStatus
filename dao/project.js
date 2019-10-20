const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const Project = function () {
};

Project.getProjectById = function (id) {
    return database.query( "SELECT * from project where id = $1", [id])
};


module.exports = Project;