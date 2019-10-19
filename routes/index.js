const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const reportDao = require("../dao/report");
const projectStatusDao = require("../dao/projectStatus");
const projectDao = require("../dao/project");

const router = express.Router();

/**
 * The default page - currently just redirects to the latest report
 */
router.get('/', security.isAuthenticated, (req, res) => {
    const url = req.session.redirect_to;
    if (url !== undefined) {
        delete req.session.redirect_to;
        res.redirect(url);
    } else {
        reportDao.getMostRecent()
            .then(result => {
                if(result.length!==1) {
                    throw("No Reports found");
                }
                res.redirect('/report/' + result[ 0 ].id)
            })
            .catch( error => {
                res.sendStatus( 500);
            })
    }
});

router.get('/project/:id(\\d+)/', security.isAuthenticated, (req, res) => {
    let projectId = parseInt(req.params.id);

    let promises = [];
    promises.push( projectDao.getById(projectId) );
    promises.push( reportDao.getProjectReports(projectId));
    promises.push( reportDao.getAll());

    Promise.all( promises )
        .then(result => {

            res.render('project',
                {
                    layout: "management",
                    project: result[0][0],
                    reports: result[1],
                    project_reports: result[2]
                });
        });
});




module.exports = router;
