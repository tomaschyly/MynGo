const Base = require ('./base');

class MongoDB extends Base {
	/**
	 * MongoDB initialization.
	 */
	constructor () {
		super ();

		this.table = 'mongodb';
	}
}

module.exports = MongoDB;
