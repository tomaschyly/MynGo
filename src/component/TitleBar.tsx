import './titleBar.css';
import ExpandArrowsAlt from '../icon/ExpandArrowsAlt';
import Home from '../icon/Home';
import Minimize from '../icon/Minimize';
import MaximizeSquare from '../icon/MaximizeSquare';
import MaximizeClone from '../icon/MaximizeClone';
import Close from '../icon/Close';

import * as React from 'react';
import * as App from '../App';
import Button from './Button';

const {remote, ipcRenderer} = window.require ('electron');

export interface Props {
	title: string;
	mainParameters: App.MainParameters;
}

export interface State {
	isMaximized: boolean;
	mainVisible: boolean,
	resetVisible: boolean;
	whichWindow?: string;
	windowId?: number;
}

class TitleBar extends React.Component<Props, State> {
	private currentWindow = remote.getCurrentWindow ();
	private onResizeListener?: EventListener;
	private mainClosedListener?: Function;
	private mainOpenedListener?: Function;
	private resetShowListener?: Function;
	private resetHideListener?: Function;

	/**
	 * TitleBar initialization.
	 */
	constructor (props: Props) {
		super (props);

		this.state = {
			isMaximized: this.IsMaximized (),
			mainVisible: false,
			resetVisible: false
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		this.onResizeListener = () => {
			const {isMaximized} = this.state;

			if (isMaximized !== this.IsMaximized ()) {
				this.setState ({
					isMaximized: this.IsMaximized ()
				});
			}
		};
		window.addEventListener ('resize', this.onResizeListener);

		this.mainClosedListener = () => {
			this.setState ({
				mainVisible: true
			});
		};
		ipcRenderer.on ('main-closed', this.mainClosedListener);

		this.mainOpenedListener = () => {
			this.setState ({
				mainVisible: false
			});
		};
		ipcRenderer.on ('main-opened', this.mainOpenedListener);

		this.resetShowListener = (event: any, message: any) => {
			this.setState ({
				resetVisible: true,
				whichWindow: message.window,
				windowId: message.windowId
			});
		};
		ipcRenderer.on ('reset-show', this.resetShowListener);

		this.resetHideListener = () => {
			this.setState ({
				resetVisible: false
			});
		};
		ipcRenderer.on ('reset-hide', this.resetHideListener);
	}

	/**
	 * Will be removed from DOM.
	 */
	componentWillUnmount () {
		if (this.onResizeListener) {
			window.removeEventListener ('resize', this.onResizeListener);
			this.onResizeListener = undefined;
		}

		ipcRenderer.removeListener ('main-closed', this.mainClosedListener);
		this.mainClosedListener = undefined;

		ipcRenderer.removeListener ('main-opened', this.mainOpenedListener);
		this.mainOpenedListener = undefined;

		ipcRenderer.removeListener ('reset-show', this.resetShowListener);
		this.resetShowListener = undefined;

		ipcRenderer.removeListener ('reset-hide', this.resetHideListener);
		this.resetHideListener = undefined;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {title, mainParameters} = this.props;
		const {isMaximized, mainVisible, resetVisible} = this.state;

		let classNames: string [] = [];
		let others: JSX.Element | null = null;
		if (mainVisible || resetVisible) {
			if (mainVisible) {
				classNames.push ('main-visible');
			}
			if (resetVisible) {
				classNames.push ('reset-visible');
			}

			if (mainParameters.platform === 'darwin') {
				others = (
					<div id="titlebar-actions-other">
						{mainVisible ? <Button type="button" id="titlebar-main" onClick={this.Main.bind (this)}><Home/></Button> : null}
						{resetVisible ? <Button type="button" id="titlebar-reset" onClick={this.Reset.bind (this)}><ExpandArrowsAlt/></Button> : null}
					</div>
				);
			} else {
				others = (
					<div id="titlebar-actions-other">
						{resetVisible ? <Button type="button" id="titlebar-reset" onClick={this.Reset.bind (this)}><ExpandArrowsAlt/></Button> : null}
						{mainVisible ? <Button type="button" id="titlebar-main" onClick={this.Main.bind (this)}><Home/></Button> : null}
					</div>
				);
			}
		}

		let elements: JSX.Element;

		switch (mainParameters.platform) {
			case 'linux':
				elements = (
					<div id="titlebar" className={classNames.join (' ')}>
						{others}

						<div id="title">{title}</div>

						<div id="titlebar-actions">
							<Button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize/></Button>
							<Button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}>
								{isMaximized ? <MaximizeClone/> : <MaximizeSquare/>}
							</Button>
							<Button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close/></Button>
						</div>
					</div>
				);

				break;
			case 'darwin':
				elements = (
					<div id="titlebar" className={classNames.join (' ')}>
						<div id="titlebar-actions">
							<Button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close/></Button>
							<Button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize/></Button>
							<Button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}>
								{isMaximized ? <MaximizeClone/> : <MaximizeSquare/>}
							</Button>
						</div>

						<div id="title">{title}</div>

						{others}
					</div>
				);

				break;
			default: 
				elements = (
					<div id="titlebar" className={classNames.join (' ')}>
						{others}

						<div id="title">{title}</div>

						<div id="titlebar-actions">
							<Button type="button" id="titlebar-minimize" onClick={this.Minimize.bind (this)}><Minimize/></Button>
							<Button type="button" id="titlebar-maximize" onClick={this.Maximize.bind (this)}>
								{isMaximized ? <MaximizeClone/> : <MaximizeSquare/>}
							</Button>
							<Button type="button" id="titlebar-close" onClick={this.Close.bind (this)}><Close/></Button>
						</div>
					</div>
				);

				break;
		}

		return elements;
	}

	/**
	 * Reset window to default.
	 */
	Reset () {
		const {whichWindow, windowId} = this.state;

		ipcRenderer.send ('window-reset', {window: whichWindow, windowId: windowId});
	}

	/**
	 * Open main window.
	 */
	Main () {
		ipcRenderer.send ('main-open');
	}

	/**
	 * Minimize window.
	 */
	Minimize () {
		this.currentWindow.minimize ();
	}

	/**
	 * Check is window maximized.
	 */
	IsMaximized (): boolean {
		return this.currentWindow.isMaximized ();
	}

	/**
	 * Maximize window.
	 */
	Maximize () {
		if (this.IsMaximized ()) {
			this.currentWindow.unmaximize ();
		} else {
			this.currentWindow.maximize ();
		}
	}

	/**
	 * Close window.
	 */
	Close () {
		this.currentWindow.close ();
	}
}

export default TitleBar;
