/**
 * Module dependencies.
 */
const appMain = require ('./app');
const debug = require ('debug') ('tch-myngo:server');
const http = require ('http');
const findFreePort = require ('find-free-port');

module.exports = async () => {
	const app = await appMain.Init ();

	let freePorts = await findFreePort (3000, 5001, '127.0.0.1');

	/**
	 * Get port from environment and store in Express.
	 */
	let port = normalizePort (
		typeof (freePorts) === 'object' && Array.isArray (freePorts) && freePorts.length > 0 ? freePorts [0] : '3001'
	);
	app.set ('port', port);
	
	/**
	 * Create HTTP server.
	 */
	let server = http.createServer (app);
	
	/**
	 * Listen on provided port, on all network interfaces.
	 */
	server.listen (port);
	server.on ('error', onError);
	server.on ('listening', onListening);

	/**
	 * Normalize a port into a number, string, or false.
	 */
	function normalizePort (val) {
		let port = parseInt (val, 10);
	
		if (isNaN (port)) {
			// named pipe
			return val;
		}
	
		if (port >= 0) {
			// port number
			return port;
		}
	
		return false;
	}
	
	/**
	 * Event listener for HTTP server "error" event.
	 */
	function onError (error) {
		if (error.syscall !== 'listen') {
			throw error;
		}
	
		let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
	
		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				// eslint-disable-next-line no-console
				console.error (bind + ' requires elevated privileges');
				process.exit (1);
				break;
			case 'EADDRINUSE':
				// eslint-disable-next-line no-console
				console.error (bind + ' is already in use');
				process.exit (1);
				break;
			default:
				throw error;
		}
	}
	
	/**
	 * Event listener for HTTP server "listening" event.
	 */
	function onListening () {
		let addr = server.address ();
		let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
		debug ('Listening on ' + bind);
	}

	return port;
};
