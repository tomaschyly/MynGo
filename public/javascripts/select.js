/* eslint-disable no-console */
/* eslint-disable no-undef */
if (typeof (TCH) === 'undefined') {
	window.TCH = {};
}

if (typeof (TCH.Select) === 'undefined') {
	const react = require ('react');
	const reactDOMServer = require ('react-dom/server');

	TCH.Select = {
		list: [],
		template: {
			actionRemove: '<svg aria-hidden="true" data-prefix="fas" data-icon="times" class="svg-inline--fa fa-times fa-w-11" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>'
		},
		globalListenersRegistered: false,

		/**
		 * Select initialization.
		 */
		Init (select = null) { 
			if (select !== null) {
				if (!select.classList.contains ('tch-select-ignore') && !select.classList.contains ('tch-select-initialized')) {
					let index = this.list.length;
					let id = `tch-select-${index}`;

					let selectHtml = [
						react.createElement ('ul', {},
							react.createElement ('li', {
								className: 'tch-select-search-container'
							},
							react.createElement ('input', {
								className: 'tch-select-search',
								type: 'text',
								autoComplete: 'off'
							}))
						),
						react.createElement ('div', {className: 'tch-select-list'},
							react.createElement ('ul', {})
						)
					];

					let container = document.createElement ('div');
					container.id = id;
					container.classList.add ('tch-select-container');
					container.innerHTML = reactDOMServer.renderToStaticMarkup (selectHtml);
					container.dataset.index = index;
					select.parentNode.insertBefore (container, select);

					this.list.push ({
						select: select,
						container: container,
						containerList: container.querySelector ('ul'),
						search: container.querySelector ('.tch-select-search'),
						selection: container.querySelector ('.tch-select-list'),
						selectionList: container.querySelector ('.tch-select-list ul'),
						options: [],
						source: typeof (select.dataset.source) !== 'undefined' ? select.dataset.source : null,
						selected: [],
						limit: typeof (select.dataset.limit) !== 'undefined' ? parseInt (select.dataset.limit) : -1,
						ajax: null
					});

					let values = TCH.Main.Utils.Select.Values (select);
					if (Array.isArray (values) && values.length > 0) {
						this.list [index].selected = values.map (value => {
							return String (value);
						});
					}

					if (!select.multiple) {
						this.list [index].limit = 1;
					}

					(select => {
						select.containerList.addEventListener ('click', () => {
							this.FocusSearch (select);
						});
						
						select.search.addEventListener ('keyup', () => {
							this.SearchSize (select);
						});
						select.search.addEventListener ('focus', () => {
							this.Selection (select);
						});
						select.search.addEventListener ('keyup', () => {
							this.Selection (select);
						});

						if (select.source !== null) {
							//TODO load options from ajax
							//TODO it will be better to use input type text instead of select for this!!!
						} else {
							select.options = Array.from (select.select.options).map (element => {
								return {
									value: element.value,
									text: element.innerText
								};
							});
						}

						if (select.selected.length > 0) {
							for (let i = 0; i < select.options.length; i++) {
								if (select.selected.includes (select.options [i].value)) {
									let newItem = document.createElement ('li');
									newItem.dataset.value = select.options [i].value;
									newItem.innerText = select.options [i].text;

									this.AddItem (select, newItem, true);
								}
							}
						}

						this.UpdateWidth (select);
					}) (this.list [index]);

					select.classList.add ('tch-select-initialized');
					select.style.display = 'none';
				}
			} else {
				this.list = [];

				let list = document.querySelectorAll ('.tch-select');
				if (list.length > 0) {
					for (let i = 0; i < list.length; i++) {
						TCH.Select.Init (list [i]);
					}
				}

				if (!this.globalListenersRegistered) {
					let body = document.querySelector ('body');
					body.addEventListener ('click', this.SelectionHide.bind (this));
					body.addEventListener ('focus', this.SelectionHide.bind (this));

					window.addEventListener ('resize', () => {
						for (let i = 0; i < this.list.length; i++) {
							(select => {
								this.UpdateWidth (select);
							}) (this.list [i]);
						}
					});

					this.globalListenersRegistered = true;
				}
			}
		},

		/**
		 * Update container width by the select.
		 */
		UpdateWidth (select) {
			select.select.style.display = 'block';

			let selectCss = getComputedStyle (select.select);
			select.container.style.width = `${selectCss.width}px`;
			
			select.select.style.display = 'none';
		},

		/**
		 * Focus search input when clicking on list.
		 */
		FocusSearch (select) {
			select.search.focus ();
		},

		/**
		 * Set size of search input.
		 */
		SearchSize (select) {
			let string = select.search.value;

			let styles = {
				position: 'absolute',
				left: '-1000px',
				top: '-1000px',
				/*display: 'none',*/
				whiteSpace: 'pre'
			};
			let searchCss = getComputedStyle (select.search);
			let styleNames = ['fontSize', 'fontStyle', 'fontWeight', 'fontFamily', 'lineHeight', 'textTransform', 'letterSpacing'];
			for (let i = 0; i < styleNames.length; i++) {
				styles [styleNames [i]] = searchCss [styleNames [i]];
			}

			let div = document.createElement ('div');
			for (let index in styles) {
				if (styles.hasOwnProperty (index)) {
					div.style [index] = styles [index];
				}
			}
			div.innerText = string;
			let body = document.querySelector ('body');
			body.appendChild (div);
			
			select.search.style.width = `${div.offsetWidth + 25}px`;
			body.removeChild (div);
		},

		/**
		 * Show selection list filtered for search string.
		 */
		Selection (select) {
			let string = select.search.value;

			let wasHidden = !select.selection.classList.contains ('tch-select-list-open');
			
			select.container.classList.add ('tch-select-container-open');
			select.selection.classList.add ('tch-select-list-open');
			select.selection.style.display = 'block';
			let selectCss = getComputedStyle (select.container);
			select.selection.style.width = `${selectCss.width}px`;

			let animateSelection = () => {
				if (wasHidden) {
					select.selection.style.height = '';
					let selectionCss = getComputedStyle (select.selection);
					let height = selectionCss.height;
	
					select.selection.style.height = '0px';
					select.selection.style.overflow = 'hidden';
					TweenMax.to (select.selection, 0.4, {height: height, onComplete: () => {
						select.selection.style.height = '';
						select.selection.style.overflow = '';
					}});
				}
			};

			if (select.limit > 0 && select.limit !== 1 && select.selected.length >= select.limit) {
				let notice = react.createElement ('li', {
					className: 'tch-select-notice'
				}, 'Limit reached');
				select.selectionList.innerHTML = reactDOMServer.renderToStaticMarkup (notice);

				animateSelection ();
				return;
			}

			let regExp = new RegExp (string, 'i');
			let filteredOptions = select.options.filter (option => {
				return regExp.test (option.text);
			});
			
			let children = [];
			for (let i = 0; i < filteredOptions.length; i++) {
				children.push (react.createElement ('li', {
					className: select.selected.includes (filteredOptions [i].value) ? 'existing-item' : 'item',
					'data-value': filteredOptions [i].value
				}, filteredOptions [i].text));
			}

			if (children.length === 0) {
				children.push (react.createElement ('li', {
					className: 'tch-select-notice'
				}, 'No matches found'));
			}

			select.selectionList.innerHTML = reactDOMServer.renderToStaticMarkup (children);

			let items = select.selectionList.querySelectorAll ('.item, .existing-item');
			if (items.length > 0) {
				for (let i = 0; i < items.length; i++) {
					(item => {
						item.addEventListener ('click', () => {
							this.AddItem (select, item);
						});
					}) (items [i]);
				}
			}

			animateSelection ();
		},

		/**
		 * Hide select list used for selection.
		 */
		SelectionHide () {
			let target = event.target;
			let visibleSelections = document.querySelectorAll ('.tch-select-list-open');

			let checkShouldBeHidden = element => {
				let targetParentContainer = TCH.Main.Utils.FindNearestParent (target, 'tch-select-container');
				let elementParentContainer = TCH.Main.Utils.FindNearestParent (element, 'tch-select-container');

				return targetParentContainer !== elementParentContainer;
			};

			if (visibleSelections.length > 0) {
				for (let i = 0; i < visibleSelections.length; i++) {
					if (checkShouldBeHidden (visibleSelections [i])) {
						visibleSelections [i].classList.remove ('tch-select-list-open');

						let container = TCH.Main.Utils.FindNearestParent (visibleSelections [i], 'tch-select-container');
						container.querySelector ('.tch-select-search').value = '';
						this.SearchSize (this.list [container.dataset.index]);
		
						((container, selection) => {
							selection.style.overflow = 'hidden';

							TweenMax.to (selection, 0.4, {height: 0, onComplete: () => {
								container.classList.remove ('tch-select-container-open');
								selection.style.display = 'none';
								selection.style.height = '';

								selection.style.overflow = '';
							}});
						}) (container, visibleSelections [i]);
					}
				}
			}
		},

		/**
		 * Add clicked item to selected.
		 */
		AddItem (select, item, onLoading) {
			if (typeof (event) !== 'undefined') {
				event.stopPropagation ();
			}
			let value = item.dataset.value;

			if (select.limit === 1 && select.selected.length > 0) {
				let items = select.containerList.querySelectorAll ('.item');

				if (items.length > 0) {
					for (let i = 0; i < items.length; i++) {
						this.RemoveItem (select, items [i], true);
					}
				}
			}

			if (!select.selected.includes (value) || typeof (onLoading) !== 'undefined') {
				if (typeof (onLoading) === 'undefined') {
					select.selected.push (value);
				}
				item.classList.remove ('item');
				item.classList.add ('existing-item');

				let newItem = document.createElement ('li');
				newItem.classList.add ('item');
				newItem.dataset.value = value;
				newItem.innerHTML = item.innerText;
				if (select.limit !== 1) {
					newItem.innerHTML += this.template.actionRemove;
				}
				select.containerList.insertBefore (newItem, select.containerList.querySelector ('.tch-select-search-container'));

				newItem.addEventListener ('click', () => {
					this.RemoveItem (select, newItem);
				});

				let option = Array.from (select.select.options).filter (element => {
					return element.value === value;
				});
				if (option.length === 1) {
					option [0].selected = true;
				}

				if (typeof (onLoading) === 'undefined') {
					newItem.style.opacity = 0;
					TweenMax.to (newItem, 0.4, {opacity: 1});
				}
			}

			if (typeof (onLoading) === 'undefined' && select.limit > 1 && select.selected.length >= select.limit) {
				select.search.value = '';

				let notice = react.createElement ('li', {
					className: 'tch-select-notice'
				}, 'Limit reached');
				select.selectionList.innerHTML = reactDOMServer.renderToStaticMarkup (notice);
			}

			if (typeof (onLoading) === 'undefined') {
				let event = document.createEvent ('HTMLEvents');
				event.initEvent ('change', false, true);
				select.select.dispatchEvent (event);
			}
		},

		/**
		 * Remove clicked item from selected.
		 */
		RemoveItem (select, item, onAddItem) {
			if (select.limit === 1 && select.selected.length <= 1 && typeof (onAddItem) === 'undefined') {
				return;
			}

			if (typeof (event) !== 'undefined') {
				event.stopPropagation ();
			}
			let value = item.dataset.value;

			select.selected = select.selected.filter (option => {
				return option !== value;
			});

			if (typeof (onAddItem) === 'undefined') {
				TweenMax.to (item, 0.4, {opacity: 0, onComplete: () => {
					item.parentNode.removeChild (item);
				}});
			} else {
				item.parentNode.removeChild (item);
			}

			let option = Array.from (select.select.options).filter (element => {
				return element.value === value;
			});
			if (option.length === 1) {
				option [0].selected = false;
			}

			if (select.selection.classList.contains ('tch-select-list-open')) {
				let oldItem = Array.from (select.selectionList.querySelectorAll ('.existing-item')).filter (element => {
					return element.dataset.value === value;
				});
				if (oldItem.length === 1) {
					oldItem [0].classList.remove ('existing-item');
					oldItem [0].classList.add ('item');
				}
			}

			if (typeof (onAddItem) === 'undefined') {
				this.Selection (select);

				let event = document.createEvent ('HTMLEvents');
				event.initEvent ('change', false, true);
				select.select.dispatchEvent (event);
			}
		}
	};

	TCH.Select.Init ();
}
