import './app.css';
import Cog from  './icon/Cog';

import * as React from 'react';
import * as ReactRouterDom from 'react-router-dom';
import User from './model/User';
import TitleBar from './component/TitleBar';
import Router from './Router';

declare global {
	// noinspection JSUnusedGlobalSymbols
	interface Window {
		require: Function;
	}
}

const {ipcRenderer} = window.require ('electron');

export interface Props {}

export interface MainParameters {
	apiUrl: string;
	directory: {
		documents: string;
	};
	platform: string;
	name: string;
	version: string;
	settings: any | null
}

export interface State {
	title: string;
	mainParameters?: MainParameters;
	user?: User;
}

class App extends React.Component<Props, State> {
	static Instance: App;

	private readonly appTitle: string;
	private mainParametersListener?: Function;

	/**
	 * App initialization.
	 */
	constructor (props: Props) {
		super (props);

		App.Instance = this;

		const title = document.getElementById ('document-title');
		this.appTitle = title && title.dataset.title ? title.dataset.title : '';

		this.state = {
			title: document.title
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		this.mainParametersListener = (event: any, message: MainParameters) => {
			setTimeout (() => this.setState ({mainParameters: message}), 400);
		};
		ipcRenderer.on ('main-parameters', this.mainParametersListener);
		ipcRenderer.send ('main-parameters');
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		ipcRenderer.removeListener ('main-parameters', this.mainParametersListener);
		this.mainParametersListener = undefined;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {title, mainParameters} = this.state;

		if (mainParameters) {
			const classNames = [mainParameters.platform];
			
			return (
				<ReactRouterDom.HashRouter>
					<div id="app" className={classNames.join (' ')}>
						<TitleBar title={title} mainParameters={mainParameters}/>

						<div id="content">
							<Router/>
						</div>
					</div>
				</ReactRouterDom.HashRouter>
			);
		} else {
			return (
				<div id="app-loader">
					<div>
						<Cog className="cog spin"/>
					</div>
				</div>
			);
		}
	}

	/**
	 * Set new view title.
	 */
	SetTitle (title: string) {
		let newTitle = '';

		if (title.length > 0) {
			newTitle = `${title} - ${this.appTitle}`;
		} else {
			newTitle = this.appTitle;
		}

		this.setState ({title: newTitle});
	}
}

export default App;
