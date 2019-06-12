const {app, ipcMain} = require ('electron');

const config = require ('../config');

const Api_static = {
	main: undefined,
	openWindows: []
};

class Api {
	/**
	 * Api initialization.
	 */
	static Init (main) {
		Api_static.main = main;

		ipcMain.on ('main-parameters', Api.MainParameters);

		ipcMain.on ('main-open', Api.OpenMain);

		ipcMain.on ('window-reset', Api.ResetWindow);

		ipcMain.on ('config-get', Api.GetConfig);

		ipcMain.on ('config-set', Api.SetConfig);
	}

	/**
	 * Window has been open, add to pool for usage.
	 */
	static OpenedWindow (which, window) {
		for (let i = 0; i < Api_static.openWindows.length; i++) {
			if (Api_static.openWindows [i].which === which && Api_static.openWindows [i].windowId === window.id) {
				throw Error ('Api.OpenedWindow - Window is already open');
			}
		}

		Api_static.openWindows.push ({
			which,
			window,
			windowId: window.id
		});
	}

	/**
	 * Window has been closed, remove from pool.
	 */
	static ClosedWindow (which, windowId) {
		for (let i = 0; i < Api_static.openWindows.length; i++) {
			if (Api_static.openWindows [i].which === which && Api_static.openWindows [i].windowId === windowId) {
				Api_static.openWindows.splice (i, 1);
				break;
			}
		}
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
			settings: Api_static.main.config.Get ('app-settings')
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

	/**
	 * Tell other windows the main window was closed.
	 */
	static ClosedMain () {
		for (let i = 0; i < Api_static.openWindows.length; i++) {
			if (Api_static.openWindows [i].window) {
				Api_static.openWindows [i].window.send ('main-closed');
			}
		}
	}

	/**
	 * Open main window if it was closed.
	 */
	static OpenMain () {
		if (Api_static.main.window === null) {
			for (let i = 0; i < Api_static.openWindows.length; i++) {
				if (Api_static.openWindows [i].window) {
					Api_static.openWindows [i].window.send ('main-opened');
				}
			}

			Api_static.main.CreateWindow ();
		}
	}

	/**
	 * Reset window to default.
	 */
	static ResetWindow (event, message) {
		for (let i = 0; i < Api_static.openWindows.length; i++) {
			if (Api_static.openWindows [i].which === message.window && Api_static.openWindows [i].windowId === message.windowId) {
				switch (message.window) {
					case Api_static.main.IDENTIFIER:
						Api_static.main.ResetWindow (Api_static.openWindows [i].window);
						break;
				}
				break;
			}
		}
	}

	/**
	 * Get all or some value from config.
	 */
	static GetConfig (event, message) {
		if (typeof (message.key) !== 'undefined') {
			const value = Api_static.main.config.Get (message.key);

			event.sender.send ('config-get', {
				key: message.key,
				value: value
			});
		} else {
			const data = Api_static.main.config.Get ();

			event.sender.send ('config-get', {
				data: data
			});
		}
	}

	/**
	 * Set value to config.
	 */
	static SetConfig (event, message) {
		if (typeof (message.key) !== 'undefined' && typeof (message.value) !== 'undefined') {
			Api_static.main.config.Set (message.key, message.value);
		}
	}
}

module.exports = Api;
