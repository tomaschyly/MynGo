import * as React from 'react';
import * as ReactRouterDom from 'react-router-dom';
import ProtectedRoute from './component/Router/ProtectedRoute';
import Login from './view/Login';
import Dashboard from './view/Dashboard';

class Router extends React.Component<object, object> {
	/**
	 * Render the component into html.
	 */
	render () {
		return (
			<ReactRouterDom.Switch>
				<ReactRouterDom.Route path="/login" component={Login}/>
				<ProtectedRoute exact={true} path="/" redirectTo="/login" component={Dashboard}/>
			</ReactRouterDom.Switch>
		);
	}
}

export default Router;
