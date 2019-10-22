const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const ProjectGroupDAO = function () {
};

ProjectGroupDAO.addProjectGroup = function (name) {

    return database.insertOrUpdate(
            `INSERT INTO project_group (name) 
             VALUES ($1)
             on CONFLICT DO NOTHING`,
        [name]);
};


module.exports = ProjectGroupDAO;