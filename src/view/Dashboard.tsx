import * as React from 'react';
import App from "../App";


class Dashboard extends React.Component<object, object> {
	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		App.Instance.SetTitle ('Dashboard');
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <p>WIP - Dashboard</p>;
	}
}

export default Dashboard;
