const Base = require ('./base');
const Database = require ('../database').Class;
const extend = require ('extend');

class User extends Base {
	/**
	 * User initialization.
	 */
	constructor () {
		super ();

		this.ROLES = Object.freeze ({
			'Admin': 1,
			'Basic': 2
		});
		this.table = 'user';
	}

	/**
	 * Data defaults.
	 */
	Defaults () {
		return {
			name: '',
			email: '',
			username: '',
			password: '',
			role: this.ROLES.Admin,
			enabled: 1,
			created: 0,
			updated: 0
		};
	}
	
	/**
	 * Load User from DB if found by email.
	 */
	async LoadByEmail (email) {
		this.Reset ();
		
		let database = new Database ();
		let row = await database.SelectTable ('*', this.table).Where ('email', database.WHERE_CONDITIONS.Equal, email).Fetch ();

		if (row !== null) {
			this.data = extend (this.Defaults (), row);
			this.id = row.id;
		}

		return this;
	}

	/**
	 * Load User from DB if found by username.
	 */
	async LoadByUsername (username) {
		this.Reset ();
		
		let database = new Database ();
		let row = await database.SelectTable ('*', this.table).Where ('username', database.WHERE_CONDITIONS.Equal, username).Fetch ();

		if (row !== null) {
			this.data = extend (this.Defaults (), row);
			this.id = row.id;
		}

		return this;
	}
}

module.exports = User;
