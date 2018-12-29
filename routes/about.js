const express = require ('express');
const router = express.Router ();
const Base = require ('./base');

class About extends Base {
	/**
	 * About initialization.
	 */
	constructor (request, response) {
		super (request, response);
	}

	/**
	 * Register route.
	 */
	Register (app) {
		app.use ('/', router.get ('/about', this.RenderAbout.bind (this)));
	}

	/**
	 * Render about.
	 */
	RenderAbout (request, response) {
		this.templateData = {
			title: 'About'
		};

		response.render ('about', this.templateData);
	}
}

module.exports = About;
