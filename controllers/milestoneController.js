'use strict';

const logger = require('../winstonLogger')(module);
const milestoneDao = require("../dao/milestoneDAO");

/**
 * Display the add milestone page
 * @param req
 * @param res
 * @param next
 */
exports.displayAddMilestonePage = function (req, res, next) {
    let project = req.project;

    res.render('milestones/addMilestone',
        {
            project: project
        });
}

exports.displayEditMilestonePage = function (req, res, next) {
    let project = req.project;
    let milestone = req.milestone;

    res.render('milestones/editMilestone',
        {
            project: project,
            milestone: milestone
        });
}

exports.displayMilestonesForProject = function (req, res, next) {
    let project = req.project;

    milestoneDao.getMilestonesForProject(project.id)
        .then(milestones => {
            res.render('milestones/listMilestonesForProject',
                {
                    project: project,
                    milestones: milestones
                });
        })
        .catch(error => {
            next(error);
        });
}

/**
 * Add a new milestone to the specified project
 * @param req
 * @param res
 * @param next
 */
exports.addMilestoneToProject = function (req, res, next) {
    let projectId = req.projectId;

    milestoneDao.addMilestoneForProject(projectId, req.body)
        .then(result => {
            res.redirect('/project/' + projectId + '/milestone');
        })
        .catch(error => {
            logger.error("Error adding new project milestone");
            next(error);
        })
};

/**
 * Update an existing milestone then redirect back to the milestone list for the project
 * @param req
 * @param res
 * @param next
 */
exports.updateMilestone = function (req, res, next) {
    let projectId = req.projectId;
    let milestoneId = req.milestoneId;
    milestoneDao.updateMilestone(milestoneId, req.body)
        .then(result => {
            res.redirect('/project/' + projectId + '/milestone');
        })
        .catch(error => {
            next(error);
        })
}

/**
 * Delete an existing milestone
 * @param req
 * @param res
 * @param next
 */
exports.deleteMilestone = function (req, res, next) {
    let projectId = req.projectId;
    let milestoneId = req.milestoneId;
    milestoneDao.deleteMilestone(milestoneId)
        .then(result => {
            res.redirect('/project/' + projectId + '/milestone');
        })
        .catch(error => {
            next(error);
        })
}

