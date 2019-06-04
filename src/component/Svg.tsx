import * as React from 'react';

export interface Props {
	path: string,
	className?: string
}

class Svg extends React.Component<Props, object> {
	/**
	 * Render the component into html.
	 */
	render () {
		const {path, className} = this.props;

		let classes = ['svg'];
		if (className) {
			classes.push (className);
		}

		return <img src={path} className={classes.join (' ')} alt="svg"/>;
	}
}

export default Svg;
