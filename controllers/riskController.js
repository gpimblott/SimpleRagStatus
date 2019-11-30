'use strict';

const logger = require('../winstonLogger')(module);

const riskDao = require("../dao/riskDAO");
const projectDao = require("../dao/projectDAO");
const audit = require("../dao/auditDAO");

const ragValues = ['Red', 'Amber', 'Green'];

const RiskController = function () {
};

/**
 * Display the add risk page
 * @param req
 * @param res
 * @param next
 */
RiskController.displayAddRiskPage = function (req, res, next) {
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
RiskController.displayRisksForProjectPage = function (req, res, next) {
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
RiskController.addProjectRisk = function (req, res, next) {
    let projectId = req.projectId;

    riskDao.addRisk(projectId, req.body)
        .then(result => {
            res.redirect('/project/' + projectId + '/risk');
        })
        .then( ()=>{
            audit.write( req.user.username, `New risk added for project ${projectId}`)
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
RiskController.editRiskPage = function (req, res, next) {
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
RiskController.updateRisk = function (req, res, next) {
    let riskId = req.riskId;
    let risk = req.risk;

    riskDao.updateRisk(riskId, req.body)
        .then(result => {
            res.redirect('/project/' + risk.project_id + '/risk');
        })
        .then( ()=>{
            audit.write( req.user.username, `Risk ${riskId} updated`)
        })
        .catch(error => {
            logger.error("Error updating risk %s", riskId);
            next(error);
        });
};

module.exports = RiskController;
