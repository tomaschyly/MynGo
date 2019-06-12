import * as React from 'react';

export interface Props {
	className?: string;
}

class MaximizeSquare extends React.Component<Props, object> {
	/**
	 * Render the component into html.
	 */
	render () {
		const {className} = this.props;

		return (
			<svg aria-hidden="true" data-prefix="far" data-icon="square"
			     className={className ? `svg-inline--fa fa-square fa-w-14 square ${className}` : 'svg-inline--fa fa-square fa-w-14 square'} role="img" xmlns="http://www.w3.org/2000/svg"
			     viewBox="0 0 448 512">
				<path fill="currentColor"
				      d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V86c0-3.3 2.7-6 6-6h340c3.3 0 6 2.7 6 6v340c0 3.3-2.7 6-6 6z"/>
			</svg>
		);
	}
}

export default MaximizeSquare;
