const Base = require ('../base');

class Bridge extends Base {
	/**
	 * Bridge initialization.
	 */
	constructor () {
		super ();

		this.table = 'mysql_bridge';
	}

	/**
	 * Data defaults.
	 */
	Defaults () {
		return {
			user_id: 0,
			name: '',
			organization: '',
			created: 0,
			updated: 0
		};
	}
}

module.exports = Bridge;
