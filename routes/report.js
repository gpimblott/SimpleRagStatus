'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const router = express.Router();

const reportController = require('../controllers/reportController');

/**
 * Intercept reportId parameter and set in request
 */
router.param('reportId', function (req, res, next, id) {
    req.reportId = parseInt(id);
    next();
});

/**
 * Display the list of reports or the add page if the action parameter is set
 */
router.get('/', security.isAuthenticatedAdminWithAction, (req, res, next) => {

    if (req.action === 'add') {
        res.render('statusReports/addReport', {});
    } else {
        res.render('statusReports/listReports', {});
    }
});

/**
 * Depending on the parameter 'action' either
 * 'edit' : Display the update page
 * 'download' : Download the spreadsheet
 * 'view' (default) : Display the report
 */
// report/{reportId}?action={edit|download|view (default) }
router.get('/:reportId(\\d+)/', security.isAuthenticatedEditorWithAction, (req, res, next) => {
    let action = req.action;

    if (action === 'edit') {
        reportController.updateReportPage(req, res, next);
    } else if (action === 'download') {
        reportController.downloadSpreadsheet(req, res, next);
    } else {
        reportController.displayReport(req, res, next);
    }
});


/**
 * Add a new report
 */
router.post('/', security.isAuthenticatedAdmin, reportController.addReport);

/**
 * Update a report (POST to an existing ID).  Should be a PUT but the frameworks don't support this
 */
router.post('/:reportId(\\d+)/', security.isAuthenticatedAdmin, reportController.updateReport);

/**
 * Delete a report by ID
 */
router.delete('/:reportId(\\d+)/', security.isAuthenticatedAdmin, reportController.deleteReport);


module.exports = router;