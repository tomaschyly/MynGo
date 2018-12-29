const express = require ('express');
const router = express.Router ();
const Base = require ('./base');

class Login extends Base {
	/**
	 * Login initialization.
	 */
	constructor (request, response) {
		super (request, response);
	}

	/**
	 * Register route.
	 */
	Register (app) {
		app.use ('/', router.get ('/login', (request, response) => {
			this.templateData = {
				title: 'Login'
			};

			response.render ('login', this.templateData);
		}));

		app.use ('/', router.post ('/login', async (request, response) => {
			if (await this.FormSubmitted (request, response)) {
				return;
			}

			this.AddFlash (request, 'Wrong login credentials inserted.', 'error');
			response.redirect ('/login');
		}));

		app.use ('/', router.get ('/login/guest', (request, response) => {
			this.AddFlash (request, 'Guest login is not implemented yet.');
			response.redirect ('/login');
		}));

		app.use ('/', router.get ('/logout', (request, response) => {
			if (require ('../model/session').Instance.Logout (request, response)) {
				this.AddFlash (request, 'Logout success.', 'success');
			} else {
				this.AddFlash (request, 'Logout failed, contact admin please.', 'error');
			}

			response.redirect ('/');
		}));
	}

	/**
	 * Process login form submit.
	 */
	async FormSubmitted (request, response) {
		if (typeof (request.body) !== 'undefined') {
			if (await require ('../model/session').Instance.Login (request, response, request.body.email, request.body.password, true)) {
				this.AddFlash (request, 'Login success.', 'success');

				response.redirect ('/');
				return true;
			}
		}

		return false;
	}
}

module.exports = Login;
