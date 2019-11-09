'use strict';

const logger = require('../winstonLogger')(module);

const riskDao = require("../dao/riskDAO");
const projectDao = require("../dao/projectDAO");

const ragValues = ['Red', 'Amber', 'Green'];

/**
 * Display the add risk page
 * @param req
 * @param res
 * @param next
 */
exports.displayAddRiskPage = function (req, res, next) {
    let projectId = req.projectId;

    riskDao.getRiskByProjectId(projectId)
        .then(results => {
            let risks = results[ 1 ];
            let project = req.project;

            res.render('risks/addRisk',
                {
                    ragValues: ragValues,
                    risks: risks,
                    projectId: projectId,
                    project: project
                });
        })
        .catch(error => {
            logger.error("Failed to display add risk page: %s", error);
            next(error);
        });
};

/**
 * Display the risk for a specific project
 * @param req
 * @param res
 * @param next
 */
exports.displayRisksForProjectPage = function (req, res, next) {
    let projectId = req.projectId;

    riskDao.getRiskByProjectId(projectId)
        .then(results => {
            let risks = results;
            let project = req.project;

            res.render('risks/listProjectRisks',
                {
                    risks: risks,
                    project: project
                });
        })
        .catch(error => {
            logger.error("Failed to get project risks: %s", error);
            next(error);
        });
};

/**
 * Add a new project risk
 * @param req
 * @param res
 */
exports.addProjectRisk = function (req, res, next) {
    let projectId = req.projectId;

    riskDao.addRisk(projectId, req.body)
        .then(result => {
            res.redirect('/project/' + projectId + '/risk');
        })
        .catch(error => {
            logger.error("Error adding project risk: %s", error);
            next(error);
        });
};

/**
 * Edit a Risk
 * @param req
 * @param res
 * @param next
 */
exports.editRiskPage = function (req, res, next) {
    let risk = req.risk;

    projectDao.getProjectById(risk.project_id)
        .then(results => {
            let project = results[ 0 ];
            res.render('risks/editRisk', {
                risk: risk,
                ragValues: ragValues,
                project: project
            });
        })
        .catch(error => {
            logger.error("Error retrieving risk : %s", error);
            next(error);
        });
};

/**
 * Update a risk
 * @param req
 * @param res
 * @param next
 */
exports.updateRisk = function (req, res, next) {
    let riskId = req.riskId;
    let risk = req.risk;

    riskDao.updateRisk(riskId, req.body)
        .then(result => {
            res.redirect('/project/' + risk.project_id + '/risk');
        })
        .catch(error => {
            logger.error("Error updating risk %s", riskId);
            next(error);
        });
}
