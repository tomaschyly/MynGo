const extend = require ('extend');

class Grid {
	/**
	 * Grid initialization.
	 * @param {function} model Database model for data
	 */
	constructor (model) {
		this.model = model;
	}

	/**
	 * Process grid request and return paramaters with data.
	 * @param {object} request Express route request 
	 * @param {object} response Express route response
	 * @param {object} paramaters Grid parameters
	 * @return {object}
	 */
	async Process (request, response, paramaters) {
		let currentData = JSON.parse (request.body.json);

		let jsonResponse = extend (true, currentData, paramaters);

		let model = new this.model ();
		jsonResponse.count = await model.Count (jsonResponse.filter);
		jsonResponse.pages = Math.ceil (jsonResponse.count / jsonResponse.pageSize);
		
		jsonResponse.items = await model.Collection (jsonResponse.filter, {
			index: jsonResponse.sort,
			direction: jsonResponse.sortDirection
		}, {
			limit: jsonResponse.pageSize,
			offset: (jsonResponse.page - 1) * jsonResponse.pageSize
		});

		return jsonResponse;
	}
}

module.exports = Grid;
