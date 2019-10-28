const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');


const ProjectDAO = function () {
};


ProjectDAO.getProjectById = function (id) {
    return database.query( "SELECT * from project where id = $1", [id])
};

ProjectDAO.getAllProjects = function () {
    return database.query(
        `select p.*,pp.name as phase_name ,pg.name as group_name
                from project p 
                    join project_phase pp on p.phase=pp.id 
                    join project_group pg on p.project_group_id = pg.id
                order by name`);
};

ProjectDAO.getProjectGroups = function () {
    return database.query( "SELECT * from project_group", [])
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

ProjectDAO.getPhaseCounts = function () {
    return database.query(`select pp.name as phase_name,count(p.name) as phase_count
                                from project p
                                right join project_phase pp on p.phase = pp.id
                                group by pp.name;`,[])
}


module.exports = ProjectDAO;