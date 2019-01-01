const mysql = require ('mysql');
const mongodb = require ('mongodb');
const nedb = require ('nedb');
const util = require ('util');
const electron = require ('electron');
const clone = require ('clone');

const WHERE_CONDITIONS = Object.freeze ({
	'Equal': 1,
	'Like': 2
});

class Database {
	/**
	 * Database connection initialization.
	 */
	constructor (config = null) {
		if (config === null) {
			config = require ('../config');
		}

		this.WHERE_CONDITIONS = WHERE_CONDITIONS;
		this.storageSystem = config.storageSystem;

		switch (this.storageSystem) {
			case 'mysql':
				this.engine = new MySQL (config);
				break;
			case 'mongodb':
				this.engine = new MongoDB (config);
				break;
			case 'nedb':
				this.engine = new NeDB (config);
				break;
		}
	}

	/**
	 * Add selection with table to current query.
	 */
	SelectTable (select, table) {
		this.engine.queryInProgress.select = select;
		this.engine.queryInProgress.collection = table;

		return this;
	}

	/**
	 * Add where condition to current query.
	 */
	Where (key, condition, value) {
		if (typeof (this.engine.queryInProgress.where) === 'undefined') {
			this.engine.queryInProgress.where = {};
		}

		this.engine.queryInProgress.where [key] = {
			condition: condition,
			value: value
		};

		return this;
	}

	/**
	 * Set sort on current query.
	 */
	Sort (key, direction) {
		this.engine.queryInProgress.sort = key;
		this.engine.queryInProgress.sortDirection = direction;

		return this;
	}

	/**
	 * Set limit and offset on current query.
	 */
	LimitOffset (limit, offset) {
		if (parseInt (limit) > 0) {
			this.engine.queryInProgress.limit = limit;
			
			if (parseInt (offset) > 0) {
				this.engine.queryInProgress.offset = offset;
			}
		}

		return this;
	}

	/**
	 * Fetch single result for current query.
	 */
	async Fetch () {
		let result = null;
		
		this.engine.queryInProgress.limit = 1;

		switch (this.storageSystem) {
			case 'mysql': {
				let sql = this.engine.QueryToSql ();
	
				result = await this.engine.RawQuery (sql);
				if (result.length > 0) {
					result = result.shift ();
				} else {
					result = null;
				}
				break;
			}
			case 'mongodb':
				//TODO
				break;
			case 'nedb': {
				let datastore = this.engine.Datastore ();
	
				let cursor = datastore.find (this.engine.Parameters ());
				cursor.exec = util.promisify (cursor.exec);
				
				cursor = this.engine.Sort (cursor);
	
				cursor = this.engine.LimitOffset (cursor);
	
				result = await cursor.exec ();
			
				if (result.length > 0) {
					result = result.shift ();
	
					result = clone (result);
	
					for (let index in result) {
						if (result.hasOwnProperty (index)) {
							if (index === '_id') {
								result ['id'] = result [index];
								delete result [index];
							}
						}
					}
				} else {
					result = null;
				}
				break;
			}
		}

		return result;
	}

	/**
	 * Fetch all results for current query.
	 */
	async FetchAll () {
		let results = [];

		switch (this.storageSystem) {
			case 'mysql': {
				let sql = this.engine.QueryToSql ();
	
				results = await this.engine.RawQuery (sql);
				break;
			}
			case 'mongodb':
				//TODO
				break;
			case 'nedb': {
				let datastore = this.engine.Datastore ();
	
				let cursor = datastore.find (this.engine.Parameters ());
				cursor.exec = util.promisify (cursor.exec);
				
				cursor = this.engine.Sort (cursor);
	
				cursor = this.engine.LimitOffset (cursor);
	
				results = await cursor.exec ();
	
				for (let i = 0; i < results.length; i++) {
					results [i] = clone (results [i]);
	
					for (let index in results [i]) {
						if (results [i].hasOwnProperty (index)) {
							if (index === '_id') {
								results [i] ['id'] = results [i] [index];
								delete results [i] [index];
							}
						}
					}
				}
				break;
			}
		}

		return results;
	}

	/**
	 * Get list of tables in database.
	 */
	async FetchTables () {
		let tables = [];

		switch (this.storageSystem) {
			case 'mysql': {
				let sql = this.engine.TablesQuery ();

				let rows = await this.engine.RawQuery (sql);

				for (let i = 0; i < rows.length; i++) {
					tables.push (rows [i].table_name);
				}
				break;
			}
			case 'mongodb':
				//TODO
				break;
			case 'nedb': 
				//TODO
				break;
		}

		return tables;
	}

	/**
	 * Get count of results for current query.
	 */
	async Count () {
		let count = 0;

		switch (this.storageSystem) {
			case 'mysql':
				//TODO
				break;
			case 'mongodb':
				//TODO
				break;
			case 'nedb': {
				let datastore = this.engine.Datastore ();
				datastore.count = util.promisify (datastore.count);
	
				count = await datastore.count (this.engine.Parameters ());
				break;
			}
		}

		return count;
	}

	/**
	 * Insert one or more items using current query.
	 */
	async Insert (rows) {
		if (!Array.isArray (rows)) {
			rows = [rows];
		}

		let results = [];
		
		this.engine.queryInProgress.rows = [];
		for (let i = 0; i < rows.length; i++) {
			this.engine.queryInProgress.rows.push (clone (rows [i]));
		}

		switch (this.storageSystem) {
			case 'mysql': {
				let sql = this.engine.QueryToSql ('insert');
	
				if (this.engine.queryInProgress.rows.length > 1) {
					results = await this.engine.RawQueries (sql.split ('\n'));
				} else {
					results = await this.engine.RawQuery (sql);
				}
				//TODO results will need to be parsed here for unified response from here
				break;
			}
			case 'mongodb':
				//TODO
				//TODO results will need to be parsed here for unified response from here
				break;
			case 'nedb': {
				let datastore = this.engine.Datastore ();
	
				for (let i = 0; i < this.engine.queryInProgress.rows.length; i++) {
					for (let index in this.engine.queryInProgress.rows [i]) {
						if (this.engine.queryInProgress.rows [i].hasOwnProperty (index)) {
							if (index === '_id' || index === 'id') {
								delete this.engine.queryInProgress.rows [i] [index];
							}
						}
					}
				}
	
				results = await datastore.insert (this.engine.queryInProgress.rows);
	
				for (let i = 0; i < results.length; i++) { 
					results [i] = results [i] ['_id'];
				}
				break;
			}
		}

		return results;
	}

	/**
	 * Update one item using current query.
	 */
	async Update (row) {
		if (Array.isArray (row)) {
			throw Error ('Update only one item at a time');
		}

		row = clone (row);

		let result = null;
		
		switch (this.storageSystem) {
			case 'mysql':
				//TODO
				//TODO results will need to be parsed here for unified response from here
				break;
			case 'mongodb':
				//TODO
				//TODO results will need to be parsed here for unified response from here
				break;
			case 'nedb': {
				let datastore = this.engine.Datastore ();
				datastore.update = util.promisify (datastore.update);
	
				for (let index in row) {
					if (row.hasOwnProperty (index)) {
						if (index === '_id' || index === 'id') {
							delete row [index];
						}
					}
				}
	
				result = await datastore.update (this.engine.Parameters (), row, {multi: false, upsert: false});
	
				result = result === 1;
				break;
			}
		}

		return result;
	}
}

class MySQL {
	/**
	 * MySQL connection initialization.
	 */
	constructor (config) {
		this.config = config;

		this.connection = mysql.createConnection ({
			host: config.db.host,
			port: config.db.port,
			user: config.db.username,
			password: config.db.password,
			database: config.db.database,
			ssl: config.db.ssl
		});

		this.connection.query = util.promisify (this.connection.query);

		this.queryInProgress = {};
	}

	/**
	 * Construct sql query from current query.
	 */
	QueryToSql (type = 'select') {
		let sql = '';
		
		switch (type) {
			case 'select':
				sql = `SELECT ${this.queryInProgress.select} FROM \`${this.queryInProgress.table}\``;
				break;
			case 'insert':
				for (let i = 0; i < this.queryInProgress.rows.length; i++) {
					let columns = [];
					let values = [];

					for (let index in this.queryInProgress.rows [i]) {
						columns.push (index);

						let value = this.queryInProgress.rows [i] [index];
						if (typeof (value) === 'number') {
							values.push (mysql.escape (value));
						} else {
							values.push (`${mysql.escape (value)}`);
						}
					}

					sql += `INSERT INTO \`${this.queryInProgress.table}\` (${columns.join (', ')}) VALUES (${values.join (', ')});\n`;
				}
				break;
			default:
				throw Error ('Not supported QueryToSql type');
		}

		if (typeof (this.queryInProgress.where) !== 'undefined') {
			let where = [];

			for (let index in this.queryInProgress.where) {
				if (this.queryInProgress.where.hasOwnProperty (index)) {
					let row = this.queryInProgress.where [index];

					switch (row.condition) {
						case WHERE_CONDITIONS.Equal:
							where.push (`${index} = ${mysql.escape (row.value)}`);
							break;
						default:
							throw Error ('Not supported QueryToSql where condition');
					}
				}
			}

			if (where.length > 0) {
				sql += ` WHERE ${where.join (' AND ')}`;
			}
		}

		//TODO order

		if (typeof (this.queryInProgress.limit) === 'number') {
			let limit = parseInt (this.queryInProgress.limit);
			if (limit < 1) {
				limit = 1;
			}

			sql += ` LIMIT ${limit}`;

			if (typeof (this.queryInProgress.offset) === 'number') {
				let offset = parseInt (this.queryInProgress.offset);

				if (offset > 0) {
					sql += ` OFFSET ${offset}`;
				}
			}
		}

		return sql;
	}

	/**
	 * Query to list tables of database.
	 */
	TablesQuery () {
		return `SELECT table_name FROM information_schema.tables where table_schema='${this.config.db.database}';`;
	}

	/**
	 * Send single raw query.
	 */
	async RawQuery (query) {
		this.connection.connect ();

		let results = await this.connection.query (query);

		this.connection.end ();

		return results;
	}

	/**
	 * Send multiple raw queries.
	 */
	async RawQueries (queries) {
		this.connection.connect ();

		let results = [];
		for (let i = 0; i < queries.length; i++) {
			if (queries [i] !== '') {
				results.push (await this.connection.query (queries [i]));
			}
		}
		
		this.connection.end ();

		return results;
	}
}

class MongoDB {
	/**
	 * MongoDB connection initialization.
	 */
	constructor (config) {
		this.client = mongodb.MongoClient;
		this.url = config.mongodb.url;
		
		this.queryInProgress = {};
	}
}

class NeDB {
	/**
	 * NeDB connection initialization.
	 */
	constructor (config) {
		this.autoload = true;
		this.autocompactionInterval = 15 * 60 * 1000;
		this.directory = config.nedb.directory;
		
		this.queryInProgress = {};
	}

	/**
	 * Get Datastore (Collection).
	 */
	Datastore () {
		let collection = new nedb ({
			filename: `${(electron.app || electron.remote.app).getPath ('userData')}/${this.directory}/${this.queryInProgress.collection}.db`,
			autoload: this.autoload
		});
		
		collection.persistence.setAutocompactionInterval (this.autocompactionInterval);

		collection.insert = util.promisify (collection.insert);
		//TODO promisify methods? for async to work!

		return collection;
	}

	/**
	 * Create NeDB parameters from current query.
	 */
	Parameters () {
		let params = {};

		if (typeof (this.queryInProgress.where) !== 'undefined') {
			for (let index in this.queryInProgress.where) {
				if (this.queryInProgress.where.hasOwnProperty (index)) {
					let row = this.queryInProgress.where [index];

					switch (row.condition) {
						case WHERE_CONDITIONS.Equal:
							params [(index === 'id' ? '_id' : index)] = row.value;
							break;
						case WHERE_CONDITIONS.Like:
							params [(index === 'id' ? '_id' : index)] = new RegExp (row.value, 'g');
							break;
						default:
							throw Error ('Not supported Parameters where condition');
					}
				}
			}
		}

		return params;
	}

	/**
	 * Set sort from current query.
	 */
	Sort (cursor) {
		if (typeof (this.queryInProgress.sort) === 'string' && typeof (this.queryInProgress.sortDirection) === 'string') {
			let sort = {};
			switch (this.queryInProgress.sortDirection) {
				case 'ASC':
					sort [this.queryInProgress.sort] = 1;
					break;
				case 'DESC':
					sort [this.queryInProgress.sort] = -1;
					break;
				default:
					throw Error ('Not supported Sorting direction');
			}

			cursor.sort (sort);
		}

		return cursor;
	}

	/**
	 * Set limit and offset from current query.
	 */
	LimitOffset (cursor) {
		if (typeof (this.queryInProgress.limit) === 'number') {
			let limit = parseInt (this.queryInProgress.limit);
			if (limit < 1) {
				limit = 1;
			}

			cursor.limit (limit);

			if (typeof (this.queryInProgress.offset) === 'number') {
				let offset = parseInt (this.queryInProgress.offset);

				if (offset > 0) {
					cursor.skip (offset);
				}
			}
		}

		return cursor;
	}
}

module.exports = {
	Class: Database,
	WHERE_CONDITIONS: WHERE_CONDITIONS
};
