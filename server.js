"use strict";

require('dotenv').config({ silent: true });

const Q = require('q');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const express = require('express');
const session = require("express-session");
const FileStore = require('session-file-store')(session);
const exphbs = require('express-handlebars');
const helpers = require('handlebars-helpers');
const passport = require('passport');
const logger = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const flash = require('connect-flash');
const boot_dir = './boot';

const app = express();

//app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'client/public')));
app.set('views', path.join(__dirname, 'handlebars/views'));
app.engine('hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'layout',
    layoutsDir: './handlebars/layouts',
    partialsDir: ['./handlebars/partials', './handlebars/views'],
    helpers: helpers()
}));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser('SECRET_GOES_HERE'));
app.use(methodOverride());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: '@#$TYHBVGHJIY^TWEYKJHNBGFDWGHJKUYTWE#$%^&*&^%$#', // 建议使用 128 个字符的随机字符串
    // cookie: {
    //   //secure: true,
    //   maxAge: 60 * 1000 * 240
    // }, // 10分鐘session
    store: new FileStore({
      path: '.sessiondb',
      ttl: 60 * 1000 * 240,
      logFn: winston.info,
      secret: '@#$TYHBVGHJIY^TWEYKJHNBGFDWGHJKUYTWE#$%^&*&^%$#', // 建议使用 128 个字符的随机字符串
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

fs.readdirSync(boot_dir).reduce((promise, file) => {
    winston.info(file);
    if (!file.startsWith('off-')) {
        return promise.then(previous => {
          return Q(require(path.join(__dirname, boot_dir, file))(app)).then(data => {
            winston.info('=== [Boot] Loaded:', file);
            return data;
          });
        });
    }
    return promise;
}, Q());

module.exports = app;
