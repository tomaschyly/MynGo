import * as React from 'react';

export interface Props {
	className?: string;
}

class Minimize extends React.Component<Props, object> {
	/**
	 * Render the component into html.
	 */
	render () {
		const {className} = this.props;

		return (
			<svg aria-hidden="true" data-prefix="fas" data-icon="minus" className={className ? `svg-inline--fa fa-minus fa-w-14 ${className}` : 'svg-inline--fa fa-minus fa-w-14'}
			     role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
				<path fill="currentColor"
				      d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
			</svg>
		);
	}
}

export default Minimize;
