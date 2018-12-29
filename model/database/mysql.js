const Base = require ('./base');

class MySQL extends Base {
	/**
	 * MySQL initialization.
	 */
	constructor () {
		super ();

		this.table = 'mysql';
	}

	/**
	 * Data defaults.
	 */
	Defaults () {
		return {
			user_id: 0,
			bridge_id: 0,
			name: '',
			organization: '',
			host: '',
			port: 0,
			username: '',
			password: '',
			database: '',
			ssl: false,
			created: 0,
			updated: 0
		};
	}
}

module.exports = MySQL;
