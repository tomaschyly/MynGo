const express = require ('express');
const router = express.Router ();
const Base = require ('./base');
const Session = require ('../model/session');
const Grid = require ('../model/grid');
const MySQLDBModel = require ('../model/database/mysql');
const MySQLBridgeDBModel = require ('../model/database/mysql/bridge');
const Form = require ('../model/form');

class MySQL extends Base {
	/**
	 * MySQL initialization.
	 */
	constructor (request, response) {
		super (request, response);
	}

	/**
	 * Register route.
	 */
	Register (app) {
		app.use ('/', router.get ('/mysql', this.RenderMysql.bind (this)));

		app.use ('/', router.post ('/mysql/grid', this.JsonMysqlGrid.bind (this)));

		app.use ('/', router.post ('/mysql/bridge/grid', this.JsonBridgeGrid.bind (this)));

		app.use ('/', router.get ('/mysql/new', this.RenderMysqlNew.bind (this)));

		app.use ('/', router.get ('/mysql/edit', this.RenderMysqlEdit.bind (this)));

		app.use ('/', router.post ('/mysql/edit', this.ProcessMysqlEdit.bind (this)));
	}

	/**
	 * Render mysql.
	 */
	RenderMysql (request, response) {
		this.templateData = {
			title: 'MySQL'
		};
		
		if (!Session.Instance.IsValidUser (request, response)) {
			response.redirect ('/login');
			return;
		}

		if (typeof request.query.id !== 'undefined') {
			this.RenderMysqlDetail (request, response);
		} else {
			this.templateData.mysqlGrid = {
				id: 'grid-mysql',
				datasource: '/mysql/grid'
			};
	
			this.templateData.bridgeGrid = {
				id: 'grid-bridge',
				datasource: '/mysql/bridge/grid'
			};
	
			response.render ('mysql', this.templateData);
		}
	}

	/**
	 * Render mysql detail.
	 */
	async RenderMysqlDetail (request, response) {
		let model = await new MySQLDBModel ().Load (request.query.id);
		
		if (!Session.Instance.IsValidUser (request, response, model.data.user_id)) {
			this.AddFlash (request, 'You are not allowed to view this database.', 'error');
			response.redirect ('/mysql');
			return;
		}

		this.templateData = {
			title: `Database - ${model.data.name}`
		};

		response.render ('mysql/detail', this.templateData);
	}

	/**
	 * Return both parameters and data for MySQL grid.
	 */
	async JsonMysqlGrid (request, response) {
		if (!Session.Instance.IsValidUser (request, response)) {
			response.json ({reload: true});
			return;
		}

		let grid = new Grid (MySQLDBModel);

		let parameters = {
			columns: [
				{
					index: 'name',
					label: 'Name',
					sort: true,
					filter: 'search'
				},
				{
					index: 'organization',
					label: 'Organization',
					sort: true,
					filter: 'search'
				},
				{
					index: 'host',
					label: 'Host',
					sort: true
				}
			],
			actions: {
				'view': {
					index: 'id',
					label: 'View Database',
					labelIndex: 'name',
					href: '/mysql',
					icon: 'view'
				},
				'edit': {
					index: 'id',
					label: 'Edit Database',
					labelIndex: 'name',
					href: '/mysql/edit',
					icon: 'edit'
				},
				'delete': {
					index: 'id',
					label: 'Delete Database',
					labelIndex: 'name',
					href: '/mysql/delete',
					icon: 'delete',
					confirm: true,
					referer: true
				}
			},
			filter: {
				'user_id': {
					value: request.session.user.id,
					static: true
				}
			}
		};

		//TODO remove test, also remove test data from collection
		/*const MySQL = require ('../model/database/mysql');
		let items = [];
		const clone = require ('clone');
		let template = {
			id: 1,
			user_id: '0AYuWMhkL2nYdX5v',
			name: 'Test',
			organization: 'Group'
		};
		for (let i = 1; i < 51; i++) {
			let cloned = clone (template);
			cloned.id = i;
			cloned.user_id = i % 2 ? 'another' : template.user_id;
			cloned.name = `${template.name} ${i}`;
			items.push (cloned);

			let dummy = new MySQL ();
			dummy.data = cloned;
			await dummy.Save ();
		}*/

		response.json (await grid.Process (request, response, parameters));
	}

	/**
	 * Return both parameters and data for MySQL Bridge grid.
	 */
	JsonBridgeGrid (request, response) {
		if (!Session.Instance.IsValidUser (request, response)) {
			response.json ({reload: true});
			return;
		}

		let jsonResponse = { //TODO parameters
			columns: [
				{
					index: 'id',
					label: 'Id',
					sort: true
				},
				{
					index: 'name',
					label: 'Name',
					sort: true,
					filter: 'search'
				},
				{
					index: 'organization',
					label: 'Organization',
					sort: true,
					filter: 'search'
				}
			],
			filter: [
				{
					index: 'user_id',
					value: request.session.user.id,
					static: true
				}
			]
		};

		//let data = [];
		//TODO data

		response.json (jsonResponse);
	}

	/**
	 * Render MySQL new.
	 */
	RenderMysqlNew (request, response) {
		this.templateData = {
			title: 'New Database'
		};
		
		this.InitMysqlForm (request, response);
	}

	/**
	 * Render MySQL edit.
	 */
	RenderMysqlEdit (request, response) {
		this.templateData = {
			title: 'Edit Database'
		};
		
		this.InitMysqlForm (request, response);
	}

	/**
	 * Initialize MySQL New/Edit form.
	 */
	async InitMysqlForm (request, response) {
		let form = new Form.Class ('mysql_edit');

		if (typeof (request.query.id) !== 'undefined') {
			let model = await new MySQLDBModel ().Load (request.query.id);
			
			if (!Session.Instance.IsValidUser (request, response, model.data.user_id)) {
				this.AddFlash (request, 'You are not allowed to edit this database.', 'error');
				response.redirect ('/mysql');
				return;
			}

			this.templateData = {
				title: `Edit Database - ${model.data.name}`
			};

			form.data = model.data;
			form.ToTemplate (response);
		} else {
			if (!Session.Instance.IsValidUser (request, response)) {
				response.redirect ('/login');
				return;
			}
		}

		form.FromSession (request);
		form.ToTemplate (response);

		response.render ('mysql/edit', this.templateData);
	}

	/**
	 * Process MySQL New/Edit form submit.
	 */
	async ProcessMysqlEdit (request, response) {
		if (!Session.Instance.IsValidUser (request, response)) {
			response.redirect ('/login');
			return;
		}

		let id = null;
		if (typeof (request.body.id) !== 'undefined') {
			id = String (request.body.id);
		}

		let form = new Form.Class ('mysql_edit', request.body);
		if (await form.Validate (this, request, {
			'name': {
				type: Form.VALIDATION_TYPES.Required,
				label: 'Name'
			},
			'host': {
				type: Form.VALIDATION_TYPES.Required,
				label: 'Host'
			},
			'port': {
				type: Form.VALIDATION_TYPES.Required,
				label: 'Port'
			},
			'username': {
				type: Form.VALIDATION_TYPES.Required,
				label: 'Username'
			},
			'password': {
				type: Form.VALIDATION_TYPES.Required,
				label: 'Password'
			},
			'database': {
				type: Form.VALIDATION_TYPES.Required,
				label: 'Database'
			}
		})) {
			let mysql = new MySQLDBModel ();
			
			mysql.data = request.body;
			mysql.id = mysql.data.id;

			mysql.data.user_id = request.session.user.id;

			let now = Math.round (new Date ().getTime () / 1000);
			mysql.data.created = now;
			mysql.data.updated = now;

			await mysql.Save ();

			this.AddFlash (request, 'Database save is a success.', 'success');
			response.redirect (`/mysql?id=${mysql.id}`);
		} else {
			form.ToSession (request);

			response.redirect (id !== null ? '/mysql/edit' : '/mysql/new');
		}
	}
}

module.exports = MySQL;
