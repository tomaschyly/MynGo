import './app.css';
import * as cog from './icon/cog.svg';

import * as React from 'react';
import * as ReactRouterDom from 'react-router-dom';
import Svg from './component/Svg';

export interface Props {}

interface State {
	mainParameters?: object
}

class App extends React.Component<Props, State> {
	static Instance?: App;

	/**
	 * App initialization.
	 */
	constructor (props: Props) {
		super (props);

		this.state = {
			mainParameters: undefined
		};
	}

	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		App.Instance = this;
	}

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		App.Instance = undefined;
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
						WIP
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
