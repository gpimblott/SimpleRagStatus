'use strict';

const logger = require('../winstonLogger')(module);

const riskDao = require("../dao/riskDAO");
const projectStatusDao = require("../dao/projectStatusDAO");


/**
 * Display the add risk page
 * @param req
 * @param res
 */
exports.displayAddRiskPage = function (req, res) {
    let projectId = req.projectId;

    let promises = [];
    promises.push(projectStatusDao.getRAGStatusValues());
    promises.push(riskDao.getRiskByProjectId(projectId));

    Promise.all(promises)
        .then(results => {
            let risks = results[ 1 ];
            let ragStatus = results[ 0 ];
            let project = req.project;

            res.render('addRisk',
                {
                    ragValues: ragStatus,
                    risks: risks,
                    projectId: projectId,
                    project: project
                });
        })
        .catch(error => {
            logger.error("Failed to display add risk page: %s", error);
            res.render('error',
                {
                    message: "Error displaying add risk page",
                    error: error
                });
        });
};

/**
 * Display the risk for a specific project
 * @param req
 * @param res
 */
exports.displayRisksForProjectPage = function (req, res) {
    let projectId = req.projectId;

    riskDao.getRiskByProjectId(projectId)
        .then(results => {
            let risks = results;
            let project = req.project;

            res.render('listProjectRisks',
                {
                    risks: risks,
                    project: project
                });
        })
        .catch(error => {
            logger.error("Failed to get project risks: %s", error);
            res.render('error',
                {
                    message: "Error getting project risks",
                    error: error
                });
        });
};

/**
 * Add a new project risk
 * @param req
 * @param res
 */
exports.addProjectRisk = function (req, res) {
    let projectId = req.projectId;

    riskDao.addRisk(projectId, req.body)
        .then(result => {
            res.redirect('/project/' + projectId + '/risk');
        })
        .catch(error => {
            logger.error("Error adding project risk: %s", error);
            res.render('error',
                {
                    message: "Error adding project risks",
                    error: error
                });
        });
};

