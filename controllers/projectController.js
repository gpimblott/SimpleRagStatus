'use strict';

const logger = require('../winstonLogger')(module);

const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");
const projectGroupDao = require("../dao/projectGroupDAO");
const projectDao = require("../dao/projectDAO");

const ragValues = ['Red','Amber','Green'];

/**
 * Display all project page - admins can edit
 * @param req
 * @param res
 * @param next
 */
exports.displayAllProjects = function (req, res, next) {

    projectDao.getAllProjects()
        .then(projects => {
            res.render('projects/listProjects',
                {
                    projects: projects
                });
        })
        .catch( error=>{
            logger.error("Failed to display all projects page: %s", error);
            next(error);
        })
}

/**
 * Display the edit project page
 * @param req
 * @param res
 * @param next
 */
exports.displayEditProjectPage = function (req, res, next) {
    let project = req.project;

    let promises = [];
    promises.push( projectGroupDao.getAll() );
    promises.push( projectDao.getProjectPhases() )

    Promise.all( promises )
        .then( results=>{
            let phases = results[1];
            let groups = results[0];
            res.render('projects/editProject',
                {
                    project: project,
                    phases: phases,
                    groups:groups
                });
        })
        .catch( error=>{
            logger.error("Failed to display edit project page: %s", error);
            next(error);
        })

}

/**
 * Display the add project page
 * @param req
 * @param res
 */
exports.displayAddProjectPage = function (req, res, next ) {
    let promises = [];
    promises.push( projectGroupDao.getAll() );
    promises.push( projectDao.getProjectPhases() )

    Promise.all( promises )
        .then( results=>{
            let phases = results[1];
            let groups = results[0];

            res.render('projects/addProject', {
                groups : groups,
                phases : phases
            });
        })
        .catch( error=> {
            logger.error("Failed to display add project page: %s", error);
            next(error);
        })

}

/**
 * Display an individual project
 * @param req
 * @param res
 * @param next
 */
exports.displayProjectPage = function (req, res, next) {
    let projectId = req.projectId;

    logger.info("Get project %s", projectId);
    reportDao.getReportsForProjectById(projectId)
        .then(reports => {
            res.render('statusReports/projectStatusReport',
                {
                    project: req.project,
                    reports: reports
                });
        })
        .catch(error => {
            logger.error("Failed to get project page: %s", error);
            next(error);
        });
};

/**
 * Display the update project report page
 * @param req
 * @param res
 * @param next
 */
exports.displayUpdateProjectReportPage = function (req, res, next) {
    let projectId = req.projectId
    let reportId = req.reportId;

    logger.info("Edit project (%s) report (%s)", projectId, reportId);

    let promises = [];
    promises.push(reportDao.getReportById(reportId));
    promises.push(projectStatusDao.getClosestReportForApplication(projectId, reportId));

    Promise.all(promises)
        .then(result => {

            let currentProject = req.project;
            let currentReport = result[ 0 ][ 0 ];
            let latestReport = result[ 1 ][ 0 ];

            if (currentProject === undefined || currentReport === undefined) {
                throw("Unable to find record");
            }

            console.log(latestReport);

            res.render('statusReports/updateProjectReport',
                {
                    report: currentReport,
                    project: currentProject,
                    ragValues: ragValues,
                    latestReport: latestReport,
                });
        })
        .catch(error => {
            logger.error("Failed to get edit project page : %s", error);
            next(error);
        });
};

/**
 * Update a project report
 * @param req
 * @param res
 * @param next
 */
exports.updateProjectReport = function (req, res, next) {
    let projectId = req.projectId;
    let reportId = req.reportId;

    logger.info("Update project (%s) report (%s)", projectId, reportId);

    projectStatusDao.updateProjectStatusForReportById(projectId, reportId, req.body)
        .then(result => {
            res.redirect("/project/" + projectId);
        })
        .catch(error => {
            logger.error("Failed to update project report : %s", error);
            next(error);
        });
}

/**
 * Update the details for a project
 * @param req
 * @param res
 * @param next
 */
exports.updateProject = function (req, res, next) {
    let projectId = req.projectId;

    projectDao.updateProject(projectId, req.body)
        .then(result => {
            res.redirect('/project');
        })
        .catch(error => {
            logger.error("Error updating project %s", projectId);
            next(error);
        })
}

/**
 * Add a new project
 * @param req
 * @param res
 * @param next
 */
exports.addProject = function (req, res, next) {

    projectDao.addProject(req.body)
        .then(result => {
            res.redirect('/project');
        })
        .catch(error => {
            logger.error("Error adding new project %s", req.body.name);
            next(error);
        })
}

/**
 * Delete a project
 * @param req
 * @param res
 * @param next
 */
exports.deleteProject = function (req, res, next) {
    let projectId = req.projectId;

    projectDao.deleteProject(projectId)
        .then(result => {
            logger.info("Project %s deleted", projectId);
            res.sendStatus(200);
        })
        .catch(error => {
            logger.error("Failed to delete project : %s", projectId)
            next(error);
        })
}