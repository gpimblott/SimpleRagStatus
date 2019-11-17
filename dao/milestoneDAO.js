'use strict';

const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const MilestoneDAO = function () {
};

/**
 * Get all the milestones for the specified project
 * @param project_id
 * @returns {Promise | Promise<unknown>}
 */
MilestoneDAO.getMilestonesForProject = function (project_id) {
    return database.query(`select *
                           from project_milestone
                           where project_id = $1
                           order by date asc`,
        [project_id])
}

/**
 * GET an individual milestone
 * @param milestone_id
 * @returns {Promise | Promise<unknown>}
 */
MilestoneDAO.getMilestoneById = function (milestone_id) {
    return database.query(`select *
                           from project_milestone
                           where id = $1
                           limit 1`,
        [milestone_id]);
}

/**
 * Add a new project milestone
 * @param project
 * @returns {Promise | Promise<unknown>}
 */
MilestoneDAO.addMilestoneForProject = function (project_id, milestone) {
    return database.insertOrUpdate(
            `INSERT INTO project_milestone (project_id, date, title, description)
             VALUES ($1, $2, $3, $4)`,
        [project_id, milestone.milestoneDate, milestone.title, milestone.description]);
};

/**
 * Update a  project milestone
 * @param project
 * @returns {Promise | Promise<unknown>}
 */
MilestoneDAO.updateMilestone = function (milestoneId, milestone) {
    return database.insertOrUpdate(
            `UPDATE project_milestone
             set date=$2,
                 title=$3,
                 description=$4
             WHERE id = $1`,
        [milestoneId, milestone.milestoneDate, milestone.title, milestone.description]);
};

/**
 * Delete milestone
 * @param project
 * @returns {Promise | Promise<unknown>}
 */
MilestoneDAO.deleteMilestone = function (milestoneId) {
    return database.deleteByIds('project_milestone', [milestoneId]);
}

module.exports = MilestoneDAO;