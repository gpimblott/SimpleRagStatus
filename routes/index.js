const logger = require('../winstonLogger')(module);
const express = require('express');

const security = require('../authentication/security');
const reportDao = require("../dao/reportDAO");
const projectDao = require('../dao/projectDAO');

const router = express.Router();

/**
 * The default page - currently just redirects to the latest report
 */
router.get('/', security.isAuthenticated, (req, res, next) => {
    const url = req.session.redirect_to;
    if (url !== undefined) {
        delete req.session.redirect_to;
        res.redirect(url);
    } else {
        reportDao.getMostRecent()
            .then(report => {
                // If there is a report defined then display it
                if(report.length===1) {
                    res.redirect('/report/' + report[0].id)
                } else {
                    res.redirect('/report?action=add');
                }
            })
            .catch(error => {
                next(error);
            })
    }
});

/**
 * High level overview of all projects and their current phase
 */
router.get('/programme', security.isAuthenticated, (req, res, next) => {

    let promises = [];
    promises.push(projectDao.getAllProjects());
    promises.push(projectDao.getPhaseCounts());

    Promise.all(promises)
        .then(results => {

            let projectArray = results[ 0 ];
            let countsArray = results[ 1 ];
            let counts = {};
            let data = {};

            countsArray.forEach(item => {
                counts[ item.phase_name ] = item.phase_count;
            });

            projectArray.forEach(item => {

                if (data.hasOwnProperty(item.group_name)) {
                    data[ item.group_name ][ item.phase_name ].push(item);
                } else {
                    data[ item.group_name ] = { Prep: [], Discovery: [], Alpha: [], Beta: [], Live: [] };
                    data[ item.group_name ][ item.phase_name ].push(item);
                }
                ;
            });

            res.render('programme', {
                layout: 'programme',
                projects: data,
                counts: counts
            });
        })
        .catch(error => {
            next(error);
        })

});

module.exports = router;
