const express = require ('express');
const router = express.Router ();
const Base = require ('./base');
const Session = require ('../model/session');

class MongoDB extends Base {
	/**
	 * MongoDB initialization.
	 */
	constructor (request, response) {
		super (request, response);
	}

	/**
	 * Register route.
	 */
	Register (app) {
		app.use ('/', router.get ('/mongodb', (request, response, next) => {
			this.templateData = {
				title: 'MongoDB'
			};

			if (!Session.Instance.IsValidUser (request, response)) {
				response.redirect ('/login');
				return;
			}

			response.render ('mongodb', this.templateData);
		}));
	}
}

module.exports = MongoDB;
