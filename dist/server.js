"use strict";
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var exphbs  = require('express-handlebars');
var helpers = require('handlebars-helpers');
var session = require("express-session");
var logger = require("morgan");
var path = require("path");
var methodOverride = require("method-override");
var indexRouter = require("./routes/index");
var loginRouter = require("./routes/login");
var User_1 = require("./routes/User");
var UserRole_1 = require("./routes/UserRole");
var model = require("./routes/model");
var custGene = require("./routes/custGene");
var custobrv = require("./routes/custobrv");
var custmotivation = require("./routes/custmotivation");
var modelDownload = require("./routes/modelDownload");
var generaudic = require("./routes/generaudic");
var talist_putupload = require("./routes/talist_putupload");
var talist_rspupload = require("./routes/talist_rspupload");
var Evtpg = require("./routes/Evtpg");
var Evad = require("./routes/Evad");
var FeedData = require("./routes/FeedData");
var NCBSData = require("./routes/NCBSData");
const targetRoute = require('./routes/target');
var Server = (function () {
    function Server(req,res) {
        this.app = express();
        this.config();
        //this.routes();
        this.app.use('/', indexRouter());
        //this.login();
        this.app.use('/', loginRouter());
		this.userinfo();
		this.userRoleinfo();
		this.model();
		this.custGene();
		this.custobrv();
		this.custmotivation();
		this.modelDownload();
		this.generaudic();
		this.talist_putupload();
		this.talist_rspupload();
		this.Evtpg();
		this.Evad();
		this.FeedData();
		this.NCBSData();
        this.errorHandler();
    }
    Server.bootstrap = function () {
        return new Server();
    };
    Server.prototype.config = function () {
        this.app.use(express.static(path.join(__dirname, 'client/public')));
        this.app.set('views', path.join(__dirname, 'handlebars/views'));
        this.app.engine('hbs', exphbs({
            extname: '.hbs',
            defaultLayout: 'layout',
            layoutsDir: './dist/handlebars/layouts',
            partialsDir: ['./dist/handlebars/partials', './dist/handlebars/views'],
            helpers: helpers()
        }));
        this.app.set('view engine', 'hbs');
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(cookieParser('SECRET_GOES_HERE'));
        this.app.use(methodOverride());
		this.app.use(session({
			secret: '@#$TYHBVGHJIY^TWEYKJHNBGFDWGHJKUYTWE#$%^&*&^%$#', // 建议使用 128 个字符的随机字符串
			cookie: { maxAge: 60 * 1000 * 10 } // 10分鐘session
		}));
		this.app.use(function (req, res, next) {

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
    };
    Server.prototype.routes = function () {
        var router;
        router = express.Router();
        console.log('==== type of express.Router(): ', typeof router);
        Index_1.IndexRoute.create(router);
        console.log('==== type of express.Router(): ', typeof router);
        this.app.use('/', router);
    };
	Server.prototype.login = function () {
        var login_router;
        login_router = express.Router();
		Login_1.LoginRoute.create(login_router);

		this.app.use('/', login_router);
    };
	Server.prototype.userinfo = function () {
        var userinfo_router;
        userinfo_router = express.Router();
		User_1.userinfoRoute.create(userinfo_router);

		this.app.use('/user', userinfo_router);
    };
	Server.prototype.userRoleinfo = function () {
        var userRoleinfo_router;
        userRoleinfo_router = express.Router();
		UserRole_1.userRoleinfoRoute.create(userRoleinfo_router);

		this.app.use('/userRole', userRoleinfo_router);
    };
	Server.prototype.model = function () {
        var model_router;
        model_router = express.Router();
		model.modelRoute.create(model_router);

		this.app.use('/model', model_router);
    };
	Server.prototype.custGene = function () {
        var custGene_router;
        custGene_router = express.Router();
		custGene.custGeneRoute.create(custGene_router);

		this.app.use('/custGene', custGene_router);
    };
	Server.prototype.custobrv = function () {
        var custobrv_router;
        custobrv_router = express.Router();
		custobrv.custobrvRoute.create(custobrv_router);

		this.app.use('/custobrv', custobrv_router);
    };
	Server.prototype.custmotivation = function () {
        var custmotivation_router;
        custmotivation_router = express.Router();
		custmotivation.custmotivationRoute.create(custmotivation_router);

		this.app.use('/custMotivation', custmotivation_router);
    };
	Server.prototype.modelDownload = function () {
        var modelDownload_router;
        modelDownload_router = express.Router();
		modelDownload.modelDownloadRoute.create(modelDownload_router);

		this.app.use('/modelDownload', modelDownload_router);
    };
	Server.prototype.generaudic = function () {
        var generaudic_router;
        generaudic_router = express.Router();
		generaudic.generaudicRoute.create(generaudic_router);

		this.app.use('/generaudic', generaudic_router);
    };
	Server.prototype.talist_putupload = function () {
        var talist_putupload_router;
        talist_putupload_router = express.Router();
		talist_putupload.talist_putuploadRoute.create(talist_putupload_router);

		this.app.use('/talist_putupload', talist_putupload_router);
    };
	Server.prototype.talist_rspupload = function () {
        var talist_rspupload_router;
        talist_rspupload_router = express.Router();
		talist_rspupload.talist_rspuploadRoute.create(talist_rspupload_router);

		this.app.use('/talist_rspupload', talist_rspupload_router);
    };
	Server.prototype.Evtpg = function () {
        var Evtpg_router;
        Evtpg_router = express.Router();
		Evtpg.EvtpgRoute.create(Evtpg_router);

		this.app.use('/Evtpg', Evtpg_router);
    };
	Server.prototype.Evad = function () {
        var Evad_router;
        Evad_router = express.Router();
		Evad.EvadRoute.create(Evad_router);

		this.app.use('/Evtad', Evad_router);
    };
	Server.prototype.FeedData = function () {
        var FeedData_router;
        FeedData_router = express.Router();
		FeedData.FeedDataRoute.create(FeedData_router);

		this.app.use('/FeedData', FeedData_router);
    };
	Server.prototype.NCBSData = function () {
        var NCBSData_router;
        NCBSData_router = express.Router();
		NCBSData.NCBSDataRoute.create(NCBSData_router);

		this.app.use('/NCBSData', NCBSData_router);
    };
    Server.prototype.errorHandler = function () {
        this.app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err['status'] = 404;
            next(err);
        });
        this.app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            if (req.originalUrl.startsWith('/api/')) {
                var result = {
                    data: '',
                    api_code: '2',
                    error_msg: err.message
                };
                res.json(result);
            }
            else {
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            }
        });
    };
	
    return Server;
}());

exports.Server = Server;

//# sourceMappingURL=server.js.map
