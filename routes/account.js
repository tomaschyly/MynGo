const express = require ('express');
const router = express.Router ();
const Base = require ('./base');
const Session = require ('../model/session');
const User = require ('../model/database/user');
const Form = require ('../model/form');

class Account extends Base {
	/**
	 * Account initialization.
	 */
	constructor (request, response) {
		super (request, response);
	}

	/**
	 * Register route.
	 */
	Register (app) {
		app.use ('/', router.get ('/account', this.RenderAccount.bind (this)));

		app.use ('/', router.get ('/account/create', (request, response) => {
			this.templateData = {
				title: 'Create Account'
			};

			let form = new Form.Class ('account_create');
			form.FromSession (request);
			form.ToTemplate (response);

			response.render ('account/create', this.templateData);
		}));

		app.use ('/', router.post ('/account/create', async (request, response) => {
			let form = new Form.Class ('account_create', request.body);

			if (await form.Validate (this, request, {
				'name': {
					type: Form.VALIDATION_TYPES.Required,
					label: 'Name'
				},
				'email': {
					type: Form.VALIDATION_TYPES.Required,
					label: 'Email'
				},
				'email_valid': {
					index: 'email',
					type: Form.VALIDATION_TYPES.Email,
					label: 'Email'
				},
				'email_unique': {
					index: 'email',
					type: Form.VALIDATION_TYPES.Unique,
					label: 'Email',
					model: User,
					modelField: 'email'
				},
				'username': {
					type: Form.VALIDATION_TYPES.Unique,
					label: 'Username',
					model: User,
					modelField: 'username'
				},
				'password': {
					type: Form.VALIDATION_TYPES.Required,
					label: 'Password'
				},
				'password_confirm': {
					type: Form.VALIDATION_TYPES.Equals,
					label: 'Confirm Password',
					field: 'password',
					fieldLabel: 'Password'
				}
			})) {
				await this.CreateSubmitted (request, response);

				response.redirect ('/');
			} else {
				form.ToSession (request);

				response.redirect ('/account/create');
			}
		}));

		app.use ('/', router.post ('/account/edit', async (request, response) => {
			if (!Session.Instance.IsValidUser (request, response)) {
				response.redirect ('/login');
				return;
			}

			let form = new Form.Class ('account_edit', request.body);

			if (await form.Validate (this, request, {
				'name': {
					type: Form.VALIDATION_TYPES.Required,
					label: 'Name'
				},
				'email': {
					type: Form.VALIDATION_TYPES.Required,
					label: 'Email'
				},
				'email_valid': {
					index: 'email',
					type: Form.VALIDATION_TYPES.Email,
					label: 'Email'
				}
			})) {
				await this.EditSubmitted (request);
			}

			response.redirect ('/account');
		}));

		app.use ('/', router.post ('/account/new-password', async (request, response) => {
			if (!Session.Instance.IsValidUser (request, response)) {
				response.redirect ('/login');
				return;
			}

			let form = new Form.Class ('account_password', request.body);
			
			if (await form.Validate (this, request, {
				'password_current': {
					type: Form.VALIDATION_TYPES.Custom,
					label: 'Current Password',
					custom: async () => {
						let user = await new User ().Load (request.session.user.id);

						if (user.id !== null && user.data.password === await Session.Instance.HashPassword (request.body.password_current)) {
							return true;
						}

						return false;
					}
				},
				'password': {
					type: Form.VALIDATION_TYPES.Required,
					label: 'Password'
				},
				'password_confirm': {
					type: Form.VALIDATION_TYPES.Equals,
					label: 'Confirm Password',
					field: 'password',
					fieldLabel: 'Password'
				}
			})) {
				await this.NewPasswordSubmitted (request);
			}

			response.redirect ('/account');
		}));
	}

	/**
	 * Render account view if logged in.
	 */
	async RenderAccount (request, response) {
		this.templateData = {
			title: 'Account'
		};

		if (!Session.Instance.IsValidUser (request, response)) {
			response.redirect ('/login');
			return;
		}

		let user = await new User ().Load (request.session.user.id);
		if (user.id !== null) {
			let userData = user.data;
			delete userData.password;

			this.AddFormData (response, 'account_edit', userData);
		}

		response.render ('account', this.templateData);
	}

	/**
	 * Create form submitted.
	 */
	async CreateSubmitted (request, response) {
		let user = new User ();

		user.data = request.body;
		delete user.data ['password_confirm'];

		let password = user.data ['password'];
		user.data ['password'] = await Session.Instance.HashPassword (user.data ['password']);

		let now = Math.round (new Date ().getTime () / 1000);
		user.data.created = now;
		user.data.updated = now;

		await user.Save ();

		if (await Session.Instance.Login (request, response, user.data ['email'], password)) {
			this.AddFlash (request, 'Account creation is a success.', 'success');
		} else {
			this.AddFlash (request, 'Account creation failed.', 'error');
		}
	}

	/**
	 * Account edit form submitted.
	 */
	async EditSubmitted (request) {
		let user = await new User ().Load (request.session.user.id);

		if (user.id !== null) {
			for (let index in request.body) {
				user.data [index] = request.body [index];
			}

			let now = Math.round (new Date ().getTime () / 1000);
			user.data.updated = now;

			await user.Save ();
			request.session.user = user.data;

			this.AddFlash (request, 'Account edit is a success.', 'success');
		} else {
			this.AddFlash (request, 'Account edit failed.', 'error');
		}
	}

	/**
	 * New password form submitted.
	 */
	async NewPasswordSubmitted (request) {
		let user = await new User ().Load (request.session.user.id);

		if (user.id !== null) {	
			user.data ['password'] = await Session.Instance.HashPassword (request.body ['password']);

			let now = Math.round (new Date ().getTime () / 1000);
			user.data.updated = now;

			await user.Save ();
			request.session.user = user.data;

			this.AddFlash (request, 'New password set.', 'success');
		} else {
			this.AddFlash (request, 'Failed to set new password.', 'error');
		}
	}
}

module.exports = Account;
