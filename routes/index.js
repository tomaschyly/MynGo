const express = require ('express');
const router = express.Router ();
const react = require ('react');
const reactDOMServer = require ('react-dom/server');
const Base = require ('./base');
const Session = require ('../model/session');
const MySQL = require ('../model/database/mysql');
const MySQLBridge = require ('../model/database/mysql/bridge');
const MongoDB = require ('../model/database/mongodb');

class Index extends Base {
	/**
	 * Index initialization.
	 */
	constructor (request, response) {
		super (request, response);
	}

	/**
	 * Register route.
	 */
	Register (app) {
		app.use ('/', router.get ('/', this.RenderIndex.bind (this)));

		return this;
	}

	/**
	 * Render index.
	 */
	async RenderIndex (request, response) {
		this.templateData = {
			title: 'Home'
		};
		
		if (!Session.Instance.IsValidUser (request, response)) {
			response.redirect ('/login');
			return;
		}

		let userId = request.session.user.id;

		let mySQL = new MySQL ();
		let mySQLCount = await mySQL.Count ({user_id: {value: userId}});
		let mySQLBridge = new MySQLBridge ();
		let mySQLBridgeCount = await mySQLBridge.Count ({user_id: {value: userId}});

		let mySQLMessage = '';
		if (mySQLCount > 0) {
			let children = [];
			children.push (react.createElement ('p', {}, `You have ${mySQLCount} connected Databases.`));

			if (mySQLBridgeCount === 0) {
				children.push (react.createElement ('p', {}, 'To add more Databases or Bridges navigate to ', react.createElement ('a', {href: '/mysql', title: 'MySQL'}, 'MySQL'), ' section.'));
			}

			mySQLMessage = reactDOMServer.renderToStaticMarkup (react.createElement ('div', {
				className: 'mysql'
			}, children));
		} 

		if (mySQLBridgeCount > 0) {
			let children = [];
			children.push (react.createElement ('p', {}, `You have ${mySQLBridgeCount} created Bridges.`));
			children.push (react.createElement ('p', {}, 'To add more Databases or Bridges navigate to ', react.createElement ('a', {href: '/mysql', title: 'MySQL'}, 'MySQL'), ' section.'));

			mySQLMessage += reactDOMServer.renderToStaticMarkup (react.createElement ('div', {
				className: 'mysql bridge'
			}, children));
		}
		
		if (mySQLMessage === '') {
			let children = [];
			children.push (react.createElement ('p', {}, 'You have not added any connections yet.'));
			children.push (react.createElement ('p', {}, 'Navigate to ', react.createElement ('a', {href: '/mysql', title: 'MySQL'}, 'MySQL'), ' section and add Database or create a Bridge.'));

			mySQLMessage = reactDOMServer.renderToStaticMarkup (react.createElement ('div', {
				className: 'mysql'
			}, children));
		}

		this.templateData.mySQLMessage = mySQLMessage;

		let mongoDB = new MongoDB ();
		let mongoDBCount = await mongoDB.Count ({user_id: {value: userId}});

		let mongoDBMessage = '';
		if (mongoDBCount > 0) {
			let children = [];
			children.push (react.createElement ('p', {}, `You have ${mongoDBCount} connected Connections.`));
			children.push (react.createElement ('p', {}, 'To add more Connections navigate to ', react.createElement ('a', {href: '/mongodb', title: 'MongoDB'}, 'MongoDB'), ' section.'));
			
			mongoDBMessage = reactDOMServer.renderToStaticMarkup (react.createElement ('div', {
				className: 'mongodb'
			}, children));
		} else {
			let children = [];
			children.push (react.createElement ('p', {}, 'You have not added any Connections yet.'));
			children.push (react.createElement ('p', {}, 'Navigate to ', react.createElement ('a', {href: '/mongodb', title: 'MongoDB'}, 'MongoDB'), ' section and add a Connection.'));

			mongoDBMessage = reactDOMServer.renderToStaticMarkup (react.createElement ('div', {
				className: 'mongodb'
			}, children));
		}

		this.templateData.mongoDBMessage = mongoDBMessage;

		response.render ('index', this.templateData);
	}
}

module.exports = Index;
