'use strict';

const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const ProjectDAO = function () {
};

/**
 * Get a specific project by ID
 * @param id
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getProjectById = function (id) {
    return database.query( "SELECT * from project where id = $1", [id])
};

/**
 * Get All projects
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getAllProjects = function () {
    return database.query(
        `select p.*,pp.name as phase_name ,pg.name as group_name
                from project p 
                    join project_phase pp on p.phase=pp.id 
                    full outer join project_group pg on p.project_group_id = pg.id
                order by name`);
};

/**
 * Get the project groups
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getProjectGroups = function () {
    return database.query( "SELECT * from project_group", [])
};

/**
 * Update a project
 * @param projectId
 * @param project
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.updateProject = function(projectId, project) {
    return database.insertOrUpdate( 'UPDATE project set name=$2 , code=$3, description=$4 , phase=$5 where id=$1',
        [projectId, project.name,project.code,project.description, project.phase])
}

/**
 * Add a new project
 * @param project
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.addProject = function( project ) {
    return database.insertOrUpdate( `INSERT INTO project (name,code,description) VALUES ($1,$2,$3)`,
        [project.name,project.code,project.description]);
}

/**
 * Delete a project
 * @param projectId
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.deleteProject = function( projectId) {
    return database.deleteByIds( 'project', [projectId]);
}

/**
 * Get the number of projects in each 'phase' e.g. discovery
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getPhaseCounts = function () {
    return database.query(`select pp.name as phase_name,count(p.name) as phase_count
                                from project p
                                right join project_phase pp on p.phase = pp.id
                                group by pp.name;`,[])
}

/**
 * Get the possible project phases
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getProjectPhases = function() {
    return database.query( `SELECT * from project_phase`);
}


module.exports = ProjectDAO;