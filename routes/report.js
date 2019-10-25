'use strict';

const logger = require('../winstonLogger')(module);
const express = require('express');
const security = require('../authentication/security');

const router = express.Router();

const reportController = require('../controllers/reportController');

/**
 * Return all of the defined reports
 */
router.get('/', security.isAuthenticated, (req, res) => {
    let action = req.query.action || "";

    if (action.toLowerCase() === 'add') {
        res.render('addReport', {});
    } else {
        res.render('listReports', {});
    }
});

/**
 * Display the edit page
 */
router.get('/:id(\\d+)/', security.isAuthenticatedAdmin, (req, res) => {
    let action = req.query.action || "";
    action = action.toLowerCase();

    if (action === 'edit') {
        reportController.editReport(req, res);
    } else if (action === 'xlsx') {
        reportController.downloadSpreadsheet(req, res);
    } else {
        reportController.displayReport(req, res);
    }
});

/**
 * Add a new report
 */
router.post('/', security.isAuthenticatedAdmin, reportController.addReport);

/**
 * Update a report (POST to an existing ID).  Should be a PUT but the frameworks don't support this
 */
router.post('/:id(\\d+)/', security.isAuthenticatedAdmin, reportController.updateReport);

/**
 * Delete a report by ID
 */
router.delete('/:id(\\d+)/', security.isAuthenticatedAdmin, reportController.deleteReport);


module.exports = router;