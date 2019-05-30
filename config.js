/*const path = require ('path');*/

let Config = {
	db: { /** Updated from ENVIRONMENT if found **/
		host: '',
		port: 3312,
		username: '',
		password: '',
		database: '',
		ssl: false
	},
	secret: 'sRUGn8mETvRBvSPz',
	storageSystem: 'nedb', /** Updated from ENVIRONMENT if found **/
	mongodb: { /** Updated from ENVIRONMENT if found **/
		url: '' /** Must include DB name in url string to work, make sure password is correct uri encoded **/
	},
	nedb: { /** Updated from ENVIRONMENT if found **/
		directory: 'var/nedb'
	},

	/**
	 * Initialize config using express for environment.
	 */
	Init () {
		/*** SHOULD NOT BE USED WITH ELECTRON APP, ONLY USE WHEN SERVER (WEB, API, etc.) ***/
		/*let host = process.env.MYNGO_DB_HOST;
		if (typeof (host) !== 'undefined') {
			this.db.host = host;
		}
		let port = process.env.MYNGO_DB_PORT;
		if (typeof (port) !== 'undefined') {
			this.db.port = port;
		}
		let username = process.env.MYNGO_DB_USERNAME;
		if (typeof (username) !== 'undefined') {
			this.db.username = username;
		}
		let password = process.env.MYNGO_DB_PASSWORD;
		if (typeof (password) !== 'undefined') {
			this.db.password = password;
		}
		let database = process.env.MYNGO_DB_DATABASE;
		if (typeof (database) !== 'undefined') {
			this.db.database = database;
		}
		let ssl = process.env.MYNGO_DB_SSL;
		if (typeof (ssl) !== 'undefined' && ssl === 'true') {
			this.db.ssl = true;
		} else if (typeof (ssl) !== 'undefined') {
			this.db.ssl = false;
		}
		let system = process.env.MYNGO_STORAGE_SYSTEM;
		if (typeof (system) !== 'undefined') {
			this.storageSystem = system;
		}
		let url = process.env.MYNGO_MONGODB_URL;
		if (typeof (url) !== 'undefined') {
			this.mongodb.url = url;
		}

		let directory = process.env.MYNGO_NEDB_DIRECTORY;
		if (typeof (directory) !== 'undefined') {
			this.nedb.directory = directory;
		}
		this.nedb.directory = this.nedb.directory.split (/\//g);
		this.nedb.directory = path.join (...this.nedb.directory);*/
	}
};

Config.Init ();

module.exports = Config;
