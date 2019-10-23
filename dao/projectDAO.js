const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const ProjectDAO = function () {
};

/**
 * Get project details for the specified ID
 * @param id ID of the project
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getProjectById = function (id) {
    return database.query( "SELECT * from project where id = $1", [id])
};


module.exports = ProjectDAO;