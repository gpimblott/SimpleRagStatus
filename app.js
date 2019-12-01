'use strict';

require('dotenv').config({ path: 'process.env' });
const passport = require('passport');
require('./authentication/passport');

import { RecognisedError } from './errors/RecognisedError';

// Logger setup
const logger = require('./winstonLogger')(module);
const morgan = require('morgan');

const express = require('express');
const session = require('express-session');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const security = require('./authentication/security');
const helpers = require('./lib/handlebarsHelpers')
const helmet = require('helmet');

// Routes
const index = require('./routes/index');
const report = require('./routes/report');
const project = require('./routes/project');
const account = require('./routes/account');
const programme = require('./routes/programme');
const authentication = require('./routes/authentication');

// DAO database access
const reportDao = require("./dao/reportDAO");
const projectDao = require("./dao/projectDAO");

const app = express();

// Setup Express and Handlebars
app.set('views', path.join(__dirname, 'views'));

let hbs = exphbs.create(
    {
        layoutsDir: path.join(__dirname, '/views/layouts/'),
        partialsDir: path.join(__dirname, '/views/partials/'),
        defaultLayout: path.join(__dirname, '/views/layouts/main'),
        helpers: helpers,
        extname: '.hbs'
    });

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Setup cookies
const cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
const cookie_name = process.env.COOKIE_NAME || 'rage_cookie';
const sess = {
    secret: cookie_key,
    name: cookie_name,
    proxy: true,
    resave: true,
    saveUninitialized: true
}

// Setup the Google Analytics ID if defined
app.locals.google_id = process.env.GOOGLE_ID || undefined;
if (app.locals.google_id) {
    logger.info('GA ID: %s', app.locals.google_id);
}

// Define static files before passport
app.use(express.static(path.join(__dirname, 'public')));

// Setup passport
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function (req, res, next) {
    res.locals.user = req.user;

    let promises = [];
    promises.push(reportDao.getAll());
    promises.push(projectDao.getProjectNames());

    Promise.all(promises).then(results => {
        res.locals.project_reports = results[ 0 ];
        res.locals.project_names = results[ 1 ];
        next();
    })
        .catch(error => {
            next();
        });
})

// Define the routes
app.use('/', index);
app.use('/report', report);
app.use('/project', project);
app.use('/account', account);
app.use('/auth', authentication);
app.use('/programme', programme);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found : ' + req.url);
    err.status = 404;
    next(err);
});

// Catch API requests and return a 500 error
function clientErrorHandler (err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' })
    } else {
        next(err)
    }
}

// General error handler
app.use(function (err, req, res, next) {
    logger.error("Error handler: %s", err.message);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    if (err instanceof RecognisedError) {
        // render the error page
        res.render('recognisedError',
            {
                message: err.message,
                title: err.title
            });
    } else {
        // render the error page
        res.render('error',
            {
                message: err.message,
                error: err
            });
    }
});

module.exports = app;
export default app;
