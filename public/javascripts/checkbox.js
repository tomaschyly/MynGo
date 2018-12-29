/* eslint-disable no-console */
/* eslint-disable no-undef */
if (typeof (TCH) === 'undefined') {
	window.TCH = {};
}

if (typeof (TCH.Checkbox) === 'undefined') {
	const react = require ('react');
	const reactDOMServer = require ('react-dom/server');
	const reactParse = require ('html-react-parser');

	TCH.Checkbox = {
		list: [],
		template: {
			active: '<svg aria-hidden="true" data-prefix="fas" data-icon="circle" class="svg-inline--fa fa-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg>'
		},

		/**
		 * Checkbox initialization.
		 */
		Init (checkbox = null) {
			if (checkbox !== null) {
				if (!checkbox.classList.contains ('tch-checkbox-ignore') && !checkbox.classList.contains ('tch-checkbox-initialized')) {
					let index = this.list.length;
					let id = `tch-checkbox-${index}`;

					let checkboxHtml = [
						react.createElement ('i', {
							className: 'tch-checkbox-icon'
						}, reactParse (this.template.active))
					];

					let container = document.createElement ('div');
					container.id = id;
					container.classList.add ('tch-checkbox-container');
					container.innerHTML = reactDOMServer.renderToStaticMarkup (checkboxHtml);
					container.dataset.index = index;
					checkbox.parentNode.insertBefore (container, checkbox);

					this.list.push ({
						checkbox: checkbox,
						container: container,
						icon: container.querySelector ('i')
					});

					(checkbox => {
						checkbox.container.addEventListener ('click', () => {
							this.Toggle (checkbox);
						});

						if (checkbox.checkbox.checked) {
							checkbox.container.classList.add ('active');
						}
					}) (this.list [index]);

					checkbox.classList.add ('tch-checkbox-initialized');
					checkbox.style.display = 'none';
				}
			} else {
				this.list = [];

				let list = document.querySelectorAll ('.tch-checkbox');
				if (list.length > 0) {
					for (let i = 0; i < list.length; i++) {
						TCH.Checkbox.Init (list [i]);
					}
				}
			}
		},

		/**
		 * Toggle checkbox.
		 */
		Toggle (checkbox) {
			checkbox.checkbox.checked = !checkbox.checkbox.checked;

			if (checkbox.checkbox.checked) {
				checkbox.container.classList.add ('active');

				checkbox.icon.style.opacity = 0;
				TweenMax.to (checkbox.icon, 0.4, {opacity: 1});
			} else {
				checkbox.icon.style.opacity = 1;

				TweenMax.to (checkbox.icon, 0.4, {opacity: 0, onComplete: () => {
					checkbox.container.classList.remove ('active');
				}});
			}
		}
	};

	TCH.Checkbox.Init ();
}
