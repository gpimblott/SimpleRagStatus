'use strict';

const logger = require('../winstonLogger')(module);

const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");
const projectGroupDao = require("../dao/projectGroupDAO");
const projectDao = require("../dao/projectDAO");
const milestoneDao = require("../dao/milestoneDAO");
const audit = require("../dao/auditDAO");

const ragValues = ['Red', 'Amber', 'Green'];

const ProjectController = function () {
};

/**
 * Display all project page - admins can edit
 * @param req
 * @param res
 * @param next
 */
ProjectController.displayAllProjects = function (req, res, next) {

    projectDao.getAllProjects()
        .then(projects => {
            res.render('projects/listProjects',
                {
                    projects: projects
                });
        })
        .catch(error => {
            logger.error("Failed to display all projects page: %s", error);
            next(error);
        })
};

/**
 * Display the edit project page
 * @param req
 * @param res
 * @param next
 */
ProjectController.displayEditProjectPage = function (req, res, next) {
    let project = req.project;

    let promises = [];
    promises.push(projectGroupDao.getAll());
    promises.push(projectDao.getProjectPhases());

    Promise.all(promises)
        .then(results => {
            let phases = results[1];
            let groups = results[0];
            res.render('projects/editProject',
                {
                    project: project,
                    phases: phases,
                    groups: groups
                });
        })
        .catch(error => {
            logger.error("Failed to display edit project page: %s", error);
            next(error);
        })
};

/**
 * Display the add project page
 * @param req
 * @param res
 */
ProjectController.displayAddProjectPage = function (req, res, next) {
    let promises = [];
    promises.push(projectGroupDao.getAll());
    promises.push(projectDao.getProjectPhases())

    Promise.all(promises)
        .then(results => {
            let phases = results[1];
            let groups = results[0];

            res.render('projects/addProject', {
                groups: groups,
                phases: phases
            });
        })
        .catch(error => {
            logger.error("Failed to display add project page: %s", error);
            next(error);
        })
};

/**
 * Display an individual project
 * @param req
 * @param res
 * @param next
 */
ProjectController.displayProjectPage = function (req, res, next) {
    let projectId = req.projectId;

    let promises = [];
    promises.push(reportDao.getReportsForProjectById(projectId));
    promises.push(milestoneDao.getMilestonesForProject(projectId));

    Promise.all(promises)
        .then(results => {
            let reports = results[0];
            let milestones = results[1];
            res.render('projects/project',
                {
                    project: req.project,
                    reports: reports,
                    milestones: milestones
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
ProjectController.displayUpdateProjectReportPage = function (req, res, next) {
    let projectId = req.projectId;
    let reportId = req.reportId;

    let promises = [];
    promises.push(reportDao.getReportById(reportId));
    promises.push(projectStatusDao.getClosestReportForApplication(projectId, reportId));

    Promise.all(promises)
        .then(result => {

            let currentProject = req.project;
            let currentReport = result[0][0];
            let latestReport = result[1][0];

            if (currentProject === undefined || currentReport === undefined) {
                throw("Unable to find record");
            }

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
ProjectController.updateProjectReport = function (req, res, next) {
    let projectId = req.projectId;
    let reportId = req.reportId;

    logger.info("Update project (%s) report (%s)", projectId, reportId);

    projectStatusDao.updateProjectStatusForReportById(projectId, reportId, req.body)
        .then(result => {
            res.redirect("/project/" + projectId);
        })
        .then ( ()=> {
            audit.write( req.user.username, `Status for report ${reportId} updated for project ${projectId}`)
        })
        .catch(error => {
            logger.error("Failed to update project report : %s", error);
            next(error);
        });
};

/**
 * Update the details for a project
 * @param req
 * @param res
 * @param next
 */
ProjectController.updateProject = function (req, res, next) {
    let projectId = req.projectId;

    projectDao.updateProject(projectId, req.body)
        .then(result => {
            res.redirect('/project');
        })
        .then ( ()=> {
            audit.write( req.user.username, `Project ${projectId} updated`)
        })
        .catch(error => {
            logger.error("Error updating project %s", projectId);
            next(error);
        })
};

/**
 * Add a new project
 * @param req
 * @param res
 * @param next
 */
ProjectController.addProject = function (req, res, next) {

    projectDao.addProject(req.body)
        .then(result => {
            res.redirect('/project');
        })
        .then ( ()=> {
            audit.write( req.user.username, `New project ${req.body.name} added`)
        })
        .catch(error => {
            logger.error("Error adding new project %s", req.body.name);
            next(error);
        })
};


/**
 * Delete a project
 * @param req
 * @param res
 * @param next
 */
ProjectController.deleteProject = function (req, res, next) {
    let projectId = req.projectId;

    projectDao.deleteProject(projectId)
        .then(result => {
            logger.info("Project %s deleted", projectId);
            res.sendStatus(200);
        })
        .then( ()=> {
            audit.write( req.user.username, `Project ${projectId} deleted`)
        })
        .catch(error => {
            logger.error("Failed to delete project : %s", projectId)
            next(error);
        })
};

module.exports = ProjectController;