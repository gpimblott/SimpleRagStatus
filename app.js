'use strict';

require('dotenv').config({ path: 'process.env' });
const passport = require('passport');
require('./authentication/passport');

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

// Routes
const index = require('./routes/index');
const authentication = require('./routes/authentication');

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
const cookie_name = process.env.COOKIE_NAME || 'my_cookie';
const sess = {
    secret: cookie_key,
    name: cookie_name,
    proxy: true,
    resave: true,
    saveUninitialized: true
}

// Define static files before passport
app.use(express.static(path.join(__dirname, 'public')));

// Setup passport
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Set a variable that will be available to all templates
app.locals.someVariable = true;

// Define the routes
app.use('/', index);
app.use('/auth', authentication);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
