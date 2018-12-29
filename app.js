const createError = require ('http-errors');
const express = require ('express');
require ('express-async-errors');
const path = require ('path');
const util = require ('util');
const cookieParser = require ('cookie-parser');
const formData = require ('express-form-data');
const session = require ('express-session');
const logger = require ('morgan');
const hbs = require ('hbs');
const electron = require ('electron');

let Main = {
	app: null,

	/**
	 * App main initialization.
	 * @returns {null|function} App Express app currently running
	 */
	async Init () {
		let app = express ();
		this.app = app;

		const config = require ('./config');

		app.use (logger ('dev'));
		app.use (express.json ());
		app.use (express.urlencoded ({extended: false}));
		app.use (cookieParser ());

		app.use (formData.parse ({
			uploadDir: path.join ((electron.app || electron.remote.app).getPath ('userData'), 'var', 'tmp'),
			autoClean: true
		}));
		app.use (formData.format ());
		app.use (formData.stream ());

		let sessionStore = undefined;
		let expiration = 24 * 60 * 60 * 1000;
		switch (config.storageSystem) {
			case 'mysql': {
				const mysqlStorage = require ('express-mysql-session') (session);
	
				sessionStore = new mysqlStorage ({
					host: config.db.host,
					port: config.db.port,
					user: config.db.username,
					password: config.db.password,
					database: config.db.database,
					charset: 'utf8_general_ci',
					expiration: expiration
				});
				break;
			}
			case 'mongodb': {
				const mongodbStorage = require ('connect-mongodb-session') (session);
				
				sessionStore = new mongodbStorage ({
					uri: config.mongodb.url,
					expires: expiration
				});
				break;
			}
			case 'nedb': {
				const nedbStorage = require ('tch-nedb-session') (session);
				
				sessionStore = new nedbStorage ({
					filename: path.join ((electron.app || electron.remote.app).getPath ('userData'), config.nedb.directory, 'sessions.db'),
					expiration: expiration,
					expirationType: 'interval',
					autoCompactInterval: 5 * 60 * 1000,
					expirationInterval: 3 * 60 * 60 * 1000
				});
				break;
			}
		}
		app.use (session ({
			secret: config.secret,
			cookie: {
				maxAge: expiration
			},
			resave: false,
			saveUninitialized: false,
			store: sessionStore
		}));
		app.use (require ('./model/session').Instance.Init);

		app.set ('views', path.join (__dirname, 'views'));
		app.set ('view engine', 'hbs');

		hbs.registerPartials = util.promisify (hbs.registerPartials);
		await hbs.registerPartials (path.join (__dirname, '/views/partials'));
		
		app.use (express.static (path.join (__dirname, 'public')));

		app.use (this.Globals);

		app.use (this.Helpers);

		app.use (this.Router.bind (this));

		// eslint-disable-next-line no-unused-vars
		app.use (function (err, req, res, next) {
			if (req.app.get ('env') === 'development') {
				// eslint-disable-next-line no-console
				console.error (err);
			}

			// set locals, only providing error in development
			res.locals.title = 'Error';
			res.locals.message = err.message;
			res.locals.error = req.app.get ('env') === 'development' ? err : {};

			// render the error page
			res.status (err.status || 500);
			res.render ('error');
		});

		return this.app;
	},

	/**
	 * Initialize global variables.
	 * @param {object} request Express route request 
	 * @param {object} response Express route response
	 * @param {function} next Run Express next middleware
	 */
	Globals (request, response, next) {
		let Globals = {};

		Globals.os = process.platform;
		switch (process.platform) {
			case 'linux':
				Globals.osIsLinux = true;
				break;
			case 'darwin':
				Globals.osIsDarwin = true;
				break;
			default:
				break;
		}

		Globals.config = require ('./config');
		
		const url = require ('url');
		Globals.currentPath = url.parse (request.url).pathname;

		response.locals.Globals = Globals;

		next ();
	},

	/**
	 * Register helpers.
	 * @param {object} request Express route request 
	 * @param {object} response Express route response
	 * @param {function} next Run Express next middleware
	 */
	Helpers (request, response, next) {
		hbs.registerHelper ('IsCurrentPathClass', function (path, condition) {
			let isCurrent = false;

			if (condition === '===') {
				isCurrent = path === response.locals.Globals.currentPath;
			} else if (condition === '*') {
				isCurrent = response.locals.Globals.currentPath.indexOf (path) === 0;
			}

			return isCurrent ? ' active' : '';
		});
		hbs.registerHelper ('DatabaseWhereConditionsJson', function () {
			let Database = require ('./model/database');
			
			return new hbs.SafeString (`<script>window.DatabaseWhereConditions = ${JSON.stringify (Database.WHERE_CONDITIONS)};</script>`);
		});

		next ();
	},

	/**
	 * Initialize router with routes.
	 * @param {object} request Express route request 
	 * @param {object} response Express route response
	 * @param {function} next Run Express next middleware
	 */
	Router (request, response, next) {
		let app = this.app;

		const Index = require ('./routes/index');
		new Index (request, response).Register (app);

		const Login = require ('./routes/login');
		new Login (request, response).Register (app);

		const Account = require ('./routes/account');
		new Account (request, response).Register (app);

		const MySQL = require ('./routes/mysql');
		new MySQL (request, response).Register (app);

		const MongoDB = require ('./routes/mongodb');
		new MongoDB (request, response).Register (app);

		const Snippet = require ('./routes/snippet');
		new Snippet (request, response).Register (app);

		const About = require ('./routes/about');
		new About (request, response).Register (app);

		app.use (function (request, response, next) {
			next (createError (404));
		});

		next ();
	}
};

module.exports = Main;
