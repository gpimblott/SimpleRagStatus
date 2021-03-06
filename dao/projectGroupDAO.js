'use strict';

const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const ProjectGroupDAO = function () {
};

/**
 * Add a new project grouping - each project can be in one group
 * @param name Name of the group
 * @returns {Promise | Promise<unknown>}
 */
ProjectGroupDAO.addProjectGroup = function (name) {

    return database.insertOrUpdate(
            `INSERT INTO project_group (name) 
             VALUES ($1)
             on CONFLICT DO NOTHING`,
        [name]);
};

/**
 * Get all of the project groups
 * @returns {Promise | Promise<unknown>}
 */
ProjectGroupDAO.getAll = function() {
    return database.query( `SELECT * from project_group`);
};


module.exports = ProjectGroupDAO;