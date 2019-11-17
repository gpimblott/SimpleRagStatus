'use strict';

const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const Cache = require('../lib/dataCache');
const ttl = 60 * 60 * 1; // cache for 1 Hour
const cache = new Cache(ttl);

const ProjectDAO = function () {
};

/**
 * Get a specific project by ID
 * @param id
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getProjectById = function (id) {
    return database.query("SELECT * from project where id = $1", [id])
};

/**
 * Get All projects
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getAllProjects = function () {
    return database.query(
            `select p.*, pp.name as phase_name, pg.name as group_name
             from project p
                      join project_phase pp on p.phase = pp.id
                      left outer join project_group pg on p.project_group_id = pg.id
             order by name`);
};

/**
 * Get the project groups
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getProjectGroups = function () {
    return database.query("SELECT * from project_group", [])
};

/**
 * Update a project
 * @param projectId
 * @param project
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.updateProject = function (projectId, project) {
    cache.flush();
    return database.insertOrUpdate(
            `UPDATE project
             set name=$2,
                 code=$3,
                 description=$4,
                 phase=$5,
                 project_group_id=$6,
                 product_owner=$7,
                 tech_lead=$8
             WHERE id = $1`,
        [projectId, project.name, project.code, project.description, project.phase,
            project.projectGroup, project.product_owner, project.tech_lead])
};

/**
 * Add a new project
 * @param project
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.addProject = function (project) {
    cache.flush();
    return database.insertOrUpdate(
            `INSERT INTO project (name, code, description, phase, project_group_id, product_owner, tech_lead)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [project.name, project.code, project.description, project.phase,
            project.projectGroup, project.product_owner, project.tech_lead]);
};



/**
 * Delete a project
 * @param projectId
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.deleteProject = function (projectId) {
    cache.flush();
    return database.deleteByIds('project', [projectId]);
};

/**
 * Get the number of projects in each 'phase' e.g. discovery
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getPhaseCounts = function () {
    return database.query(`select pp.name as phase_name, count(p.name) as phase_count
                           from project p
                                    right join project_phase pp on p.phase = pp.id
                           group by pp.name;`, [])
};

/**
 * Get the possible project phases
 * @returns {Promise | Promise<unknown>}
 */
ProjectDAO.getProjectPhases = function () {
    return database.query(`SELECT *
                           from project_phase`);
};

/**
 * Get the list of project names
 * @returns {*|Promise<unknown>}
 */
ProjectDAO.getProjectNames = function () {
    return cache.get("project_names", () => {
        return database.query('SELECT id,name from project order by name');
    });
}

module.exports = ProjectDAO;