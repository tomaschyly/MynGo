import './app.css';
import * as cog from './icon/cog.svg';

import * as React from 'react';
import * as ReactRouterDom from 'react-router-dom';
import User from './model/User';
import Router from './Router';
import Svg from './component/Svg';

declare global {
	interface Window {
		require: Function
	}
}

const {ipcRenderer} = window.require ('electron');

export interface Props {}

export interface State {
	mainParameters?: object,
	user?: User
}

class App extends React.Component<Props, State> {
	static Instance?: App;

	mainParametersListener?: Function;

	/**
	 * App initialization.
	 */
	constructor (props: Props) {
		super (props);

		this.state = {};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		App.Instance = this;

		this.mainParametersListener = (event: object, message: object) => {
			this.setState ({mainParameters: message});
		};
		ipcRenderer.on ('main-parameters', this.mainParametersListener);
		ipcRenderer.send ('main-parameters');
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		App.Instance = undefined;

		ipcRenderer.removeListener ('main-parameters', this.mainParametersListener);
		this.mainParametersListener = undefined;
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {mainParameters} = this.state;

		if (mainParameters) {
			return (
				<ReactRouterDom.HashRouter>
					<div id="app">
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
						<Svg path={cog} className="cog spin"/>
					</div>
				</div>
			);
		}
	}
}

export default App;
