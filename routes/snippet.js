const express = require ('express');
const router = express.Router ();
const Base = require ('./base');
const Session = require ('../model/session');
const User = require ('../model/database/user');

class Snippet extends Base {
	/**
	 * Snippet initialization.
	 */
	constructor (request, response) {
		super (request, response);
	}

	/**
	 * Register route.
	 */
	Register (app) {
		app.use ('/', router.get ('/snippet', this.RenderSnippets.bind (this)));
	}

	/**
	 * Render snippets if logged in.
	 */
	RenderSnippets (request, response) {
		this.templateData = {
			title: 'Snippets'
		};

		if (!Session.Instance.IsValidUser (request, response)) {
			response.redirect ('/login');
			return;
		}

		response.render ('snippet', this.templateData);
	}
}

module.exports = Snippet;
