let emailValidator = require ('email-validator');

let VALIDATION_TYPES = Object.freeze ({
	'Required': 1,
	'Email': 2,
	'Unique': 3,
	'Equals': 4,
	'Custom': 5
});

class Form {
	/**
	 * Form initialization.
	 * @param {string} form Form's identifier
	 * @param {object} data Form's data for processing
	 */
	constructor (form, data = null) {
		this.form = form;
		this.data = data;
	}

	/**
	 * Add Form data to template.
	 */
	ToTemplate (response) {
		if (typeof (response.locals.formdata) === 'undefined') {
			response.locals.formdata = {};
		}

		response.locals.formdata [this.form] = this.data;
	}

	/**
	 * Get form data from session and clear all.
	 */
	FromSession (request, clear = true) {
		if (typeof (request.session.formData) !== 'undefined') {
			if (typeof (request.session.formData [this.form]) !== 'undefined') {
				this.data = request.session.formData [this.form];
			}

			if (clear) {
				delete request.session.formData;
			}

			return this.data;
		}

		return null;
	}

	/**
	 * Add form data to session.
	 */
	ToSession (request) {
		if (typeof (request.session.formData) === 'undefined') {
			request.session.formData = {};
		}

		request.session.formData [this.form] = this.data;
	}

	/**
	 * Validate form data based on parameters.
	 */
	async Validate (route, request, params, oneInvalid = false) { 
		let validity = true;

		for (let index in params) {
			if (params.hasOwnProperty (index)) {
				let rowIndex = typeof (params [index].index) !== 'undefined' ? params [index].index : index;

				switch (params [index].type) {
					case VALIDATION_TYPES.Required:
						if (typeof (this.data [rowIndex]) === 'undefined' || String (this.data [rowIndex]).length === 0) {
							route.AddFlash (request, `${params [index].label} is required field.`, 'error');
							validity = false;

							if (oneInvalid) {
								return false;
							}
						}
						break;
					case VALIDATION_TYPES.Email:
						if (typeof (this.data [rowIndex]) !== 'undefined' && !emailValidator.validate (this.data [rowIndex])) {
							route.AddFlash (request, `${params [index].label} must be valid email address.`, 'error');
							validity = false;

							if (oneInvalid) {
								return false;
							}
						}
						break;
					case VALIDATION_TYPES.Unique: {
						let model = new params [index].model;
						let filter = {};
						filter [params [index].modelField] = {
							value: this.data [rowIndex]
						};

						if (typeof (this.data [rowIndex]) !== 'undefined' && await model.Count (filter) > 0) {
							route.AddFlash (request, `${params [index].label} must be unique.`, 'error');
							validity = false;

							if (oneInvalid) {
								return false;
							}
						}
						break;
					}
					case VALIDATION_TYPES.Equals:
						if (typeof (this.data [rowIndex]) !== 'undefined' && this.data [rowIndex] !== this.data [params [index].field]) {
							route.AddFlash (request, `${params [index].label} must be the same as ${params [index].fieldLabel}.`, 'error');
							validity = false;

							if (oneInvalid) {
								return false;
							}
						}
						break;
					case VALIDATION_TYPES.Custom:
						if (!await params [index].custom ()) {
							route.AddFlash (request, `${params [index].label} is not valid.`, 'error');
							validity = false;

							if (oneInvalid) {
								return false;
							}
						}
						break;
				}
			}
		}

		return validity;
	}
}

module.exports = {
	Class: Form,
	VALIDATION_TYPES: VALIDATION_TYPES
};
