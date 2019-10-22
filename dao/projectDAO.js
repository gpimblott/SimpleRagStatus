const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const ProjectDAO = function () {
};

ProjectDAO.getProjectById = function (id) {
    return database.query( "SELECT * from project where id = $1", [id])
};


module.exports = ProjectDAO;