import * as React from 'react';
import App from '../App';

class Login extends React.Component<object, object> {
	/**
	 * First rendered to DOM.
	 */
	componentDidMount () {
		App.Instance.SetTitle ('Login');
	}

	/**
	 * Render the component into html.
	 */
	render () {
		return <p>WIP - Login</p>;
	}
}

export default Login;
