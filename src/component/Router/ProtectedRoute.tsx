import * as React from 'react';
import * as ReactRouterDom from 'react-router-dom';
import App from '../../App';

export interface Props extends ReactRouterDom.RouteProps {
	redirectTo: string
}

class ProtectedRoute extends ReactRouterDom.Route<Props> {
	/**
	 * Render the component into html.
	 */
	render () {
		const {component, redirectTo, ...rest} = this.props;

		if (App.Instance && App.Instance.state.user) {
			return <ReactRouterDom.Route {...rest} component={component}/>;
		} else {
			return <ReactRouterDom.Redirect to={redirectTo}/>;
		}
	}
}

export default ProtectedRoute;
