'use strict';

const logger = require('../winstonLogger')(module);

const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");

/**
 * Display an individual project
 * @param req
 * @param res
 */
exports.displayProjectPage = function (req, res) {
    let projectId = req.projectId;

    logger.info("Get project %s", projectId);
    reportDao.getReportsForProjectById(projectId)
        .then(reports => {
            res.render('project',
                {
                    project: req.project,
                    reports: reports
                });
        })
        .catch(error => {
            logger.error("Failed to get project page: %s", error);
            res.render('error',
                {
                    message: "Error getting project report",
                    error: error
                });
        });
};

/**
 * Display the update project report page
 * @param req
 * @param res
 */
exports.displayUpdateProjectReportPage = function (req, res) {
    let projectId = req.projectId
    let reportId = req.reportId;

    logger.info("Edit project (%s) report (%s)", projectId, reportId);

    let promises = [];
    promises.push(reportDao.getReportById(reportId));
    promises.push(projectStatusDao.getRAGStatusValues());
    promises.push(projectStatusDao.getClosestReportForApplication(projectId, reportId));

    Promise.all(promises)
        .then(result => {

            let currentProject = req.project;
            let currentReport = result[ 0 ][ 0 ];
            let ragValues = result[ 1 ];
            let latestReport = result[ 2 ][ 0 ];

            if (currentProject === undefined || currentReport === undefined || ragValues === undefined) {
                throw("Unable to find record");
            }

            res.render('updateProjectReport',
                {
                    report: currentReport,
                    project: currentProject,
                    ragValues: ragValues,
                    latestReport: latestReport,
                });
        })
        .catch(error => {
            logger.error("Failed to get edit project page : %s", error);
            res.render('error',
                {
                    message: "Error adding new report",
                    error: error
                });
        });
};

/**
 * Update a project report
 * @param req
 * @param res
 */
exports.updateProjectReport = function (req, res) {
    let projectId = req.projectId;
    let reportId = req.reportId;

    logger.info("Update project (%s) report (%s)", projectId, reportId);

    projectStatusDao.updateProjectStatusForReportById(projectId, reportId, req.body)
        .then(result => {
            res.redirect("/project/" + projectId);
        })
        .catch(error => {
            logger.error("Failed to update project report : %s", error);
            res.render('error',
                {
                    message: "Error updating report report",
                    error: error
                });
        });
}