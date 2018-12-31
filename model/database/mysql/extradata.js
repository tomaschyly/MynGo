const Base = require ('../base');

class ExtraData extends Base {
	/**
	 * ExtraData  initialization.
	 */
	constructor () {
		super ();

		this.table = 'mysql_extradata';
	}

	/** 
	 * Data defaults.
	 */
	Defaults () {
		return {
			mysql_id: 0,
			tables: {},
			created: 0,
			updated: 0
		};
	}
}

module.exports = ExtraData;
