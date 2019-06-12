import * as React from 'react';

export interface Props {
	className?: string;
}

class MaximizeClone extends React.Component<Props, object> {
	/**
	 * Render the component into html.
	 */
	render () {
		const {className} = this.props;

		return (
			<svg aria-hidden="true" data-prefix="far" data-icon="clone"
			     className={className ? `svg-inline--fa fa-clone fa-w-16 clone ${className}` : 'svg-inline--fa fa-clone fa-w-16 clone'} role="img" xmlns="http://www.w3.org/2000/svg"
			     viewBox="0 0 512 512">
				<path fill="currentColor"
				      d="M464 0H144c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h320c26.51 0 48-21.49 48-48v-48h48c26.51 0 48-21.49 48-48V48c0-26.51-21.49-48-48-48zM362 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h42v224c0 26.51 21.49 48 48 48h224v42a6 6 0 0 1-6 6zm96-96H150a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h308a6 6 0 0 1 6 6v308a6 6 0 0 1-6 6z"/>
			</svg>
		);
	}
}

export default MaximizeClone;
