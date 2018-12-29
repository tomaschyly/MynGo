const {app, BrowserWindow} = require ('electron');
const path = require ('path');

/*** Make sure to have correct environment variable set or use this, but it needs to be commented out on live! ***/
process.env.TCH_DEV_PLATFORM = 'true';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

const singleAppLock = app.requestSingleInstanceLock ();

let Main = {
	window: null,
	port: null,

	/**
	 * Create main app window.
	 */
	async CreateWindow () {
		if (this.port === null) {
			this.port = await require ('./server') ();
		}

		switch (process.platform) {
			case 'linux':
				this.window = new BrowserWindow ({
					width: 800,
					minWidth: 640,
					height: 600,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.png'),
					/*webPreferences: {
						nodeIntegration: false
					}*/
				});
				break;
			case 'darwin':
				this.window = new BrowserWindow ({
					width: 800,
					minWidth: 640,
					height: 600,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.icns'),
					/*webPreferences: {
						nodeIntegration: false
					}*/
				});
				break;
			default:
				this.window = new BrowserWindow ({
					width: 800,
					minWidth: 640,
					height: 600,
					minHeight: 480,
					frame: false,
					center: true,
					show: false,
					icon: path.join (__dirname, 'icon.ico'),
					/*webPreferences: {
						nodeIntegration: false
					}*/
				});
		}

		this.window.loadURL (`http://127.0.0.1:${this.port}/`);

		this.window.once ('ready-to-show', () => {
			this.window.setMenu (null);

			this.window.show ();

			if (typeof (process.env.TCH_DEV_PLATFORM) !== 'undefined' && process.env.TCH_DEV_PLATFORM === 'true') {
				this.window.webContents.openDevTools ();
			}
		});

		this.window.on ('closed', () => {
			this.window = null;
		});
	}
};

if (singleAppLock) {
	app.on ('ready', () => {
		Main.CreateWindow ();
	});
	
	app.on ('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit ();
		}
	});
	
	app.on ('activate', () => {
		if (Main.window === null) {
			Main.CreateWindow ();
		}
	});

	app.on ('second-instance', () => {
		if (Main.window !== null) {
			if (Main.window.isMinimized ()) {
				Main.window.restore ();
			}

			Main.window.focus ();
		}
	});
} else {
	app.quit ();
}
