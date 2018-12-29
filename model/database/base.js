const Database = require ('../database').Class;
const extend = require ('extend');

class Base {
	/**
	 * Base initialization.
	 */
	constructor () {
		this.table = '';
		this.data = [];
		this.id = null;
	}

	/**
	 * Reset data.
	 */
	Reset () {
		this.data = [];
		this.id = null;
	}

	/**
	 * Data defaults, need to be overriden inside child class.
	 */
	Defaults () {
		throw Error ('Provide defaults by overriding inside child class');
	}

	/**
	 * Load data from DB.
	 */
	async Load (id) {
		this.Reset ();

		let database = new Database ();
		let row = await database.SelectTable ('*', this.table).Where ('id', database.WHERE_CONDITIONS.Equal, id).Fetch ();
		
		if (row !== null) {
			this.data = extend (this.Defaults (), row);
			this.id = row.id;
		}

		return this;
	}

	/**
	 * Load data from data.
	 */
	LoadFromData (data) {
		this.data = extend (this.Defaults (), data);
		this.id = data.id;
	}

	/**
	 * Save data to DB.
	 */
	async Save () {
		let database = new Database ();
		let old = this.id !== null ? await database.SelectTable ('*', this.table).Where ('id', database.WHERE_CONDITIONS.Equal, this.id).Fetch () : null;

		let saveData = extend (this.Defaults (), this.data);

		database = new Database ();
		if (old !== null) {
			await database.SelectTable ('*', this.table).Where ('id', database.WHERE_CONDITIONS.Equal, this.id).Update (saveData);
		} else {
			let results = await database.SelectTable ('*', this.table).Insert (saveData);
			this.data.id = results [0];
			this.id = results [0];
		}

		return this;
	}

	/**
	 * Delete from DB.
	 */
	async Delete () {
		//TODO 
		throw Error ('Delete not implemented yet');

		return this;
	}

	/**
	 * Get number of rows in DB.
	 */
	async Count (filter = {}) {
		let database = new Database ().SelectTable ('*', this.table);

		for (let index in filter) {
			if (filter.hasOwnProperty (index)) {
				database = database.Where (index, typeof (filter [index].condition) !== 'undefined' ? filter [index].condition : database.WHERE_CONDITIONS.Equal, filter [index].value);
			}
		}

		return await database.Count ();
	}

	/**
	 * Get all rows from DB.
	 */
	async Collection (filter = {}, sort = {index: 'id', direction: 'ASC'}, limit = {limit: -1, offset: -1}, asObject = null) {
		let database = new Database ().SelectTable ('*', this.table);

		for (let index in filter) {
			if (filter.hasOwnProperty (index)) {
				database = database.Where (index, typeof (filter [index].condition) !== 'undefined' ? filter [index].condition : database.WHERE_CONDITIONS.Equal, filter [index].value);
			}
		}

		database = database.Sort (sort.index, sort.direction).LimitOffset (limit.limit, limit.offset);

		let data = await database.FetchAll ();

		if (data.length > 0 && asObject !== null) {
			for (let i = 0; i < data.length; i++) {
				let _data = data [i];
				data [i] = new asObject ();
				data [i].LoadFromData (_data);
			}
		}

		return data;
	}
}

module.exports = Base;
