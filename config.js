const path = require ('path');

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
		let host = process.env.DB_HOST;
		if (typeof (host) !== 'undefined') {
			this.db.host = host;
		}
		let port = process.env.DB_PORT;
		if (typeof (port) !== 'undefined') {
			this.db.port = port;
		}
		let username = process.env.DB_USERNAME;
		if (typeof (username) !== 'undefined') {
			this.db.username = username;
		}
		let password = process.env.DB_PASSWORD;
		if (typeof (password) !== 'undefined') {
			this.db.password = password;
		}
		let database = process.env.DB_DATABASE;
		if (typeof (database) !== 'undefined') {
			this.db.database = database;
		}
		let ssl = process.env.DB_SSL;
		if (typeof (ssl) !== 'undefined' && ssl === 'true') {
			this.db.ssl = true;
		} else if (typeof (ssl) !== 'undefined') {
			this.db.ssl = false;
		}
		let system = process.env.STORAGE_SYSTEM;
		if (typeof (system) !== 'undefined') {
			this.storageSystem = system;
		}
		let url = process.env.MONGODB_URL;
		if (typeof (url) !== 'undefined') {
			this.mongodb.url = url;
		}

		let directory = process.env.NEDB_DIRECTORY;
		if (typeof (directory) !== 'undefined') {
			this.nedb.directory = directory;
		}
		this.nedb.directory = this.nedb.directory.split (/\//g);
		this.nedb.directory = path.join (...this.nedb.directory);
	}
};

Config.Init ();

module.exports = Config;
