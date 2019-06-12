import './button.css';

import * as React from 'react';

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: JSX.Element | JSX.Element [];
}

class Button extends React.Component<Props, object> {
	private button: React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement> ();
	private blurTimeout?: NodeJS.Timeout;

	/**
	 * Called before component is removed from DOM.
	 */
	componentWillUnmount () {
		if (this.blurTimeout) {
			clearTimeout (this.blurTimeout);
			this.blurTimeout = undefined;
		}
	}

	/**
	 * Render the component into html.
	 */
	render () {
		const {type, children, ...rest} = this.props;
		
		return (
			<button {...rest} ref={this.button} type={type || 'button'} onClick={this.OnClick.bind (this)}>
				{children}
			</button>
		);
	}

	/**
	 * OnClick execute onClick action of present and remove focus.
	 */
	OnClick (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		const {onClick} = this.props;

		if (onClick) {
			onClick (e);
		}

		if (this.blurTimeout) {
			clearTimeout (this.blurTimeout);
			this.blurTimeout = undefined;
		}

		this.blurTimeout = setTimeout (() => {
			if (this.button.current) {
				this.button.current.blur ();
			}
		}, 400);
	}
}

export default Button;
