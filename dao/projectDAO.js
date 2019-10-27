const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const ProjectDAO = function () {
};


ProjectDAO.getProjectById = function (id) {
    return database.query( "SELECT * from project where id = $1", [id])
};

ProjectDAO.getAllProjects = function () {
    return database.query("select * from project order by name");
};

ProjectDAO.updateProject = function(projectId, project) {
    return database.insertOrUpdate( 'UPDATE project set name=$2 , code=$3, description=$4 where id=$1',
        [projectId, project.name,project.code,project.description])
}

ProjectDAO.addProject = function( project ) {
    return database.insertOrUpdate( `INSERT INTO project (name,code,description) VALUES ($1,$2,$3)`,
        [project.name,project.code,project.description]);
}

ProjectDAO.deleteProject = function( projectId) {
    return database.deleteByIds( 'project', [projectId]);
}


module.exports = ProjectDAO;