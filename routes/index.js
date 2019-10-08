const express = require('express');
const router = express.Router();
const security = require('../authentication/security');


// Setup the routes
router.get('/', security.isAuthenticated,  (req, res) => {
    const url = req.session.redirect_to;
    if (url != undefined) {
        delete req.session.redirect_to;
        res.redirect(url);
    }
    else {
        res.render('index');
    }
});

module.exports = router;
