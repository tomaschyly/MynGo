const util = require ('util');
const Config = require ('../config');
const User = require ('./database/user');

class Session {
	/**
	 * Session initialization.
	 */
	constructor () {
		this.crypto = require ('crypto');
		this.crypto.pbkdf2 = util.promisify (this.crypto.pbkdf2);
		this.iterations = 10;
		this.keylen = 64;
		this.digest = 'sha512';
	}

	/**
	 * Initialize user session.
	 */
	Init (request, response, next) {
		response.locals.userLoggedIn = false;
		if (typeof (request.session.user) === 'object') {
			response.locals.userLoggedIn = true;
		}

		next ();
	}

	/**
	 * Async hash password string.
	 */
	async HashPassword (password) {
		let hash = await this.crypto.pbkdf2 (password, Config.secret, this.iterations, this.keylen, this.digest);
		return hash.toString ('base64');
	}

	/**
	 * Verify user is logged in and optionally if it is correct one.
	 * @param {object} request Express route request 
	 * @param {object} response Express route response
	 * @param {string|number} correctUserId Correct user id
	 * @param {string|number} correctUserRole Correct user role 
	 * @returns {boolean}
	 */
	IsValidUser (request, response, correctUserId = '', correctUserRole = 0) {
		if (!response.locals.userLoggedIn) {
			return false;
		}

		correctUserId = String (correctUserId);
		if (correctUserId.length > 0 && correctUserId !== String (request.session.user.id)) {
			return false;
		}

		correctUserRole = parseInt (correctUserRole);
		return !(correctUserRole > 0 && correctUserRole !== parseInt (request.session.user.role));
	}

	/**
	 * Encrypt string data to hex using password.
	 * Retuns null on fail.
	 */
	Encrypt (data, password) {
		const cipher = this.crypto.createCipher ('aes192', password);

		try {
			let encrypted = cipher.update (data, 'utf8', 'hex');
			encrypted += cipher.final ('hex');

			return encrypted;
		} catch (error) {
			console.error (error);
		}

		return null;
	}

	/**
	 * Decrypt hex to string data using password.
	 * Retuns null on fail.
	 */
	Decrypt (hex, password) {
		const decipher = this.crypto.createDecipher ('aes192', password);
		
		try {
			let decrypted = decipher.update (hex, 'hex', 'utf8');
			decrypted += decipher.final ('utf8');
	
			return decrypted;
		} catch (error) {
			console.error (error);
		}

		return null;
	}

	/**
	 * Login user if correct credentials.
	 */
	async Login (request, response, email, password, tryUsername = false) {
		let user = await new User ().LoadByEmail (email);

		if (user.id === null && tryUsername) {
			user = await user.LoadByUsername (email);
		}

		if (user.id !== null) {
			let hash = await this.HashPassword (password);
			let dbPassword = user.data.password;

			if (hash === dbPassword) {
				request.session.user = user.data;
				response.locals.userLoggedIn = true;

				return true;
			}
		}

		return false;
	}

	/**
	 * Logout current user.
	 */
	Logout (request, response) {
		if (typeof (request.session.user) === 'object') {
			delete request.session.user;
			response.locals.userLoggedIn = false;

			return true;
		}

		return false;
	}
}

let SessionInstance = new Session ();

module.exports = {
	Class: Session,
	Instance: SessionInstance
};
