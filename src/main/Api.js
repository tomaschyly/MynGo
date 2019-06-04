const {app, ipcMain} = require ('electron');

const config = require ('../config');

const Api_static = {
	main: undefined
};

class Api {
	/**
	 * Api initialization.
	 */
	static Init (main) {
		Api_static.main = main;

		ipcMain.on ('main-parameters', Api.MainParameters);
	}

	/**
	 * Send main process (Electron) parameters to renderer.
	 */
	static MainParameters (event) {
		const appPackage = require ('../../package');

		const parameters = {
			apiUrl: config.api.url,
			directory: {
				documents: app.getPath ('documents')
			},
			platform: process.platform,
			name: appPackage.productName,
			version: appPackage.version,
			settings: Main.config.Get ('app-settings')
		};

		switch (process.platform) {
			case 'linux':
				parameters.osIsLinux = true;
				break;
			case 'darwin':
				parameters.osIsDarwin = true;
				break;
			default:
				break;
		}

		event.sender.send ('main-parameters', parameters);
	}
}

module.exports = Api;
