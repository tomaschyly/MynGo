const hbs = require ('hbs');
const react = require ('react');
const reactDOMServer = require ('react-dom/server');
const reactParse = require ('html-react-parser');
const Form = require ('../model/form');

class Base {
	/**
	 * Base initilization.
	 */
	// eslint-disable-next-line no-unused-vars
	constructor (request, response) {
		this.templateData = {};

		hbs.registerHelper ('RenderFlashes', function () {
			let flashes = request.session.flashes;
			if (typeof (flashes) !== 'undefined') {
				delete request.session.flashes;

				if (flashes.length > 0) {
					for (let i = 0; i < flashes.length; i++) {
						flashes [i] = reactParse (flashes [i]);
					}

					flashes = react.createElement ('div', {
						className: 'container',
						id: 'flashes-supercontainer'
					}, react.createElement ('div', {
						className: 'panel thin flashes'
					}, flashes));

					flashes = reactDOMServer.renderToStaticMarkup (flashes);
				}
			}

			return flashes;
		});
	}

	/**
	 * Add flash message to flashes.
	 */
	AddFlash (request, message, type = 'info') {
		if (typeof (request.session.flashes) === 'undefined') {
			request.session.flashes = [];
		}

		request.session.flashes.push (reactDOMServer.renderToStaticMarkup (react.createElement ('p', {
			className: `flash ${type}`
		}, message)));
	}

	/**
	 * Add form data to template.
	 */
	AddFormData (response, form, data) {
		new Form.Class (form, data).ToTemplate (response);
	}
}

module.exports = Base;
