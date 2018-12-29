/* eslint-disable no-console */
/* eslint-disable no-undef */
if (typeof (TCH) === 'undefined') {
	window.TCH = {};
}

if (typeof (TCH.Grid) === 'undefined') {
	const react = require ('react');
	const reactDOMServer = require ('react-dom/server');
	const reactParse = require ('html-react-parser');
	const extend = require ('extend');

	TCH.Grid = {
		list: [],
		template: {
			sortAsc: '<svg aria-hidden="true" data-prefix="fas" data-icon="chevron-circle-up" class="svg-inline--fa fa-chevron-circle-up fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M8 256C8 119 119 8 256 8s248 111 248 248-111 248-248 248S8 393 8 256zm231-113.9L103.5 277.6c-9.4 9.4-9.4 24.6 0 33.9l17 17c9.4 9.4 24.6 9.4 33.9 0L256 226.9l101.6 101.6c9.4 9.4 24.6 9.4 33.9 0l17-17c9.4-9.4 9.4-24.6 0-33.9L273 142.1c-9.4-9.4-24.6-9.4-34 0z"></path></svg>',
			sortDesc: '<svg aria-hidden="true" data-prefix="fas" data-icon="chevron-circle-down" class="svg-inline--fa fa-chevron-circle-down fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zM273 369.9l135.5-135.5c9.4-9.4 9.4-24.6 0-33.9l-17-17c-9.4-9.4-24.6-9.4-33.9 0L256 285.1 154.4 183.5c-9.4-9.4-24.6-9.4-33.9 0l-17 17c-9.4 9.4-9.4 24.6 0 33.9L239 369.9c9.4 9.4 24.6 9.4 34 0z"></path></svg>',
			actionView: '<svg aria-hidden="true" data-prefix="far" data-icon="eye" class="svg-inline--fa fa-eye fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M569.354 231.631C512.97 135.949 407.81 72 288 72 168.14 72 63.004 135.994 6.646 231.631a47.999 47.999 0 0 0 0 48.739C63.031 376.051 168.19 440 288 440c119.86 0 224.996-63.994 281.354-159.631a47.997 47.997 0 0 0 0-48.738zM288 392c-102.556 0-192.091-54.701-240-136 44.157-74.933 123.677-127.27 216.162-135.007C273.958 131.078 280 144.83 280 160c0 30.928-25.072 56-56 56s-56-25.072-56-56l.001-.042C157.794 179.043 152 200.844 152 224c0 75.111 60.889 136 136 136s136-60.889 136-136c0-31.031-10.4-59.629-27.895-82.515C451.704 164.638 498.009 205.106 528 256c-47.908 81.299-137.444 136-240 136z"></path></svg>',
			actionEdit: '<svg aria-hidden="true" data-prefix="far" data-icon="edit" class="svg-inline--fa fa-edit fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M402.3 344.9l32-32c5-5 13.7-1.5 13.7 5.7V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h273.5c7.1 0 10.7 8.6 5.7 13.7l-32 32c-1.5 1.5-3.5 2.3-5.7 2.3H48v352h352V350.5c0-2.1.8-4.1 2.3-5.6zm156.6-201.8L296.3 405.7l-90.4 10c-26.2 2.9-48.5-19.2-45.6-45.6l10-90.4L432.9 17.1c22.9-22.9 59.9-22.9 82.7 0l43.2 43.2c22.9 22.9 22.9 60 .1 82.8zM460.1 174L402 115.9 216.2 301.8l-7.3 65.3 65.3-7.3L460.1 174zm64.8-79.7l-43.2-43.2c-4.1-4.1-10.8-4.1-14.8 0L436 82l58.1 58.1 30.9-30.9c4-4.2 4-10.8-.1-14.9z"></path></svg>',
			actionDelete: '<svg aria-hidden="true" data-prefix="far" data-icon="trash-alt" class="svg-inline--fa fa-trash-alt fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M192 188v216c0 6.627-5.373 12-12 12h-24c-6.627 0-12-5.373-12-12V188c0-6.627 5.373-12 12-12h24c6.627 0 12 5.373 12 12zm100-12h-24c-6.627 0-12 5.373-12 12v216c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12V188c0-6.627-5.373-12-12-12zm132-96c13.255 0 24 10.745 24 24v12c0 6.627-5.373 12-12 12h-20v336c0 26.51-21.49 48-48 48H80c-26.51 0-48-21.49-48-48V128H12c-6.627 0-12-5.373-12-12v-12c0-13.255 10.745-24 24-24h74.411l34.018-56.696A48 48 0 0 1 173.589 0h100.823a48 48 0 0 1 41.16 23.304L349.589 80H424zm-269.611 0h139.223L276.16 50.913A6 6 0 0 0 271.015 48h-94.028a6 6 0 0 0-5.145 2.913L154.389 80zM368 128H80v330a6 6 0 0 0 6 6h276a6 6 0 0 0 6-6V128z"></path></svg>'
		},

		/**
		 * Grid initialization.
		 */
		Init () {
			this.list = [];

			let list = document.querySelectorAll ('.tch-grid');
			if (list.length > 0) {
				for (let i = 0; i < list.length; i++) {
					this.list.push ({
						container: list [i],
						id: list [i].dataset.grid,
						datasource: list [i].dataset.datasource,
						data: {
							texts: {
								noItems: 'There are no items here.',
								page: 'Page ',
								pageSize: 'Size '
							},
							columns: [],
							actions: {},
							filter: {},
							items: [],
							count: 0,
							page: 1,
							pages: 0,
							pageSize: 10,
							pageSizes: [5, 10, 25, 50, 100],
							sort: 'id',
							sortDirection: 'ASC'
						}
					});

					(grid => {
						this.UpdateData (grid, grid => {
							this.Render (grid, true);
						});
					}) (this.list [i]);
				}
			}
		},

		/**
		 * Load and update data from datasource by ajax.
		 */
		UpdateData (grid, onLoad) {
			if (typeof (grid.ajaxInProgress) !== 'undefined') {
				grid.ajaxInProgress.abort ();
				delete grid.ajaxInProgress;
			}

			let formData = new FormData ();
			formData.append ('json', JSON.stringify (grid.data));

			grid.ajaxInProgress = new XMLHttpRequest ();
			grid.ajaxInProgress.addEventListener ('load', () => {
				try {
					let data = JSON.parse (grid.ajaxInProgress.responseText);

					if (typeof (data.reload) !== 'undefined') {
						TCH.Main.Navigation.Load (window.location.href);
						return;
					}

					if (typeof (data) === 'object') {
						grid.data = extend (grid.data, data);
					}
				} catch (error) {
					console.error (error);

					TCH.Main.Navigation.Load (window.location.href);
					return;
				}

				if (grid.data.page > grid.data.pages) {
					grid.data.page = grid.data.pages;

					this.UpdateData (grid, onLoad);
					return;
				}

				if (typeof (onLoad) !== 'undefined') {
					onLoad (grid);
				}
			});
			grid.ajaxInProgress.addEventListener ('error', () => {
				console.error (grid.ajaxInProgress);
			});
			grid.ajaxInProgress.open ('POST', grid.datasource);
			grid.ajaxInProgress.send (formData);
		},

		/**
		 * Render grid to html.
		 */
		Render (grid, renderInFull = false) {
			if (renderInFull) {
				let form = react.createElement ('form', {
					className: 'tch-grid-form',
					action: '',
					method: 'GET'
				}, react.createElement ('div', {
					className: 'tch-grid-header'
				}), react.createElement ('div', {
					className: 'tch-grid-body'
				}), react.createElement ('div', {
					className: 'tch-grid-footer'
				}));
	
				grid.container.innerHTML = reactDOMServer.renderToStaticMarkup (form);

				this.RenderHeader (grid);
			}

			this.RenderBody (grid);

			this.RenderFooter (grid);

			this.GridActions (grid, renderInFull);
		},

		/**
		 * Render grid header to elements.
		 */
		RenderHeader (grid) {
			let elements = [];

			let sortRowChildren = [];
			for (let i = 0; i < grid.data.columns.length; i++) {
				let children = [
					react.createElement ('span', {}, grid.data.columns [i].label)
				];

				if (typeof (grid.data.columns [i].sort) !== 'undefined' && grid.data.columns [i].sort) {
					let icon = this.template.sortAsc;
					if (grid.data.columns [i].index === grid.data.sort && grid.data.sortDirection === 'ASC') {
						icon = this.template.sortDesc;
					}

					children.push (react.createElement ('button', {
						className: `tch-grid-sort icon${grid.data.columns [i].index === grid.data.sort ? ' active' : ''}`, 
						type: 'button',
						'data-index': grid.data.columns [i].index
					}, reactParse (icon)));
				}

				sortRowChildren.push (react.createElement ('div', {className: 'tch-grid-col center'}, children));
			}
			if (!TCH.Main.Utils.Object.IsEmpty (grid.data.actions)) {
				sortRowChildren.push (react.createElement ('div', {className: 'tch-grid-col'}));
			}
			elements.push (react.createElement ('div', {
				className: 'tch-grid-row'
			}, sortRowChildren));

			let atLeastOneFilter = false;
			let filterRowChildren = [];
			for (let i = 0; i < grid.data.columns.length; i++) {
				let children = [];
				
				if (typeof (grid.data.columns [i].filter) !== 'undefined') {
					switch (grid.data.columns [i].filter) {
						case 'search': {
							atLeastOneFilter = true;

							let options = {
								className: `tch-grid-filter-search tch-grid-filter-search-${grid.data.columns [i].index}`,
								type: 'text',
								'data-index': grid.data.columns [i].index,
								value: typeof (grid.data.filter [grid.data.columns [i].index]) !== 'undefined' ? grid.data.filter [grid.data.columns [i].index].value : ''
							};

							if (typeof (grid.data.filter [grid.data.columns [i].index]) !== 'undefined') {
								options ['data-last-value'] = grid.data.filter [grid.data.columns [i].index].value;
							}

							children.push (react.createElement ('input', options));
							break;
						}
					}
				}

				filterRowChildren.push (react.createElement ('div', {className: 'tch-grid-col'}, children));
			}
			if (atLeastOneFilter) {
				if (!TCH.Main.Utils.Object.IsEmpty (grid.data.actions)) {
					filterRowChildren.push (react.createElement ('div', {className: 'tch-grid-col'}));
				}

				elements.push (react.createElement ('div', {
					className: 'tch-grid-row'
				}, filterRowChildren));
			}

			grid.container.querySelector ('.tch-grid-header').innerHTML = reactDOMServer.renderToStaticMarkup (elements);
		},

		/**
		 * Render grid body to elements.
		 */
		RenderBody (grid) {
			let elements = [];

			if (grid.data.items.length > 0) {
				grid.container.classList.remove ('empty');

				for (let i = 0; i < grid.data.items.length; i++) {
					let rowChildren = [];

					for (let j = 0; j < grid.data.columns.length; j++) {
						let content = 'N/A';
						if (typeof (grid.data.items [i] [grid.data.columns [j].index]) !== 'undefined') {
							content = grid.data.items [i] [grid.data.columns [j].index];
						}

						rowChildren.push (react.createElement ('div', {className: 'tch-grid-col'}, react.createElement ('span', {}, content)));
					}

					if (!TCH.Main.Utils.Object.IsEmpty (grid.data.actions)) {
						let actions = [];
						for (let index in grid.data.actions) {
							if (grid.data.actions.hasOwnProperty (index)) {
								let icon = null;
								switch (grid.data.actions [index] ['icon']) {
									case 'view':
										icon = reactParse (this.template.actionView);
										break;
									case 'edit':
										icon = reactParse (this.template.actionEdit);
										break;
									case 'delete':
										icon = reactParse (this.template.actionDelete);
										break;
									default:
										throw Error ('Not supported Action type');
								}

								let referer = typeof (grid.data.actions [index] ['referer']) !== 'undefined' ? `&referer=${encodeURIComponent (window.location.href)}` : '';

								actions.push (react.createElement ('button', {
									className: 'tch-grid-action icon',
									type: 'button',
									'data-href': `${grid.data.actions [index] ['href']}?${grid.data.actions [index] ['index']}=${grid.data.items [i] [grid.data.actions [index] ['index']]}${referer}`,
									'data-confirm': (typeof (grid.data.actions [index] ['confirm']) !== 'undefined' ? true : false),
									title: `${grid.data.actions [index] ['label']}${(typeof (grid.data.actions [index] ['labelIndex']) === 'string' && typeof (grid.data.items [i] [grid.data.actions [index] ['labelIndex']]) !== 'undefined' ? ` ${grid.data.items [i] [grid.data.actions [index] ['labelIndex']]}` : '')}`
								}, icon));
							}
						}
						rowChildren.push (react.createElement ('div', {className: 'tch-grid-col right'}, actions));
					}

					elements.push (react.createElement ('div', {
						className: 'tch-grid-row'
					}, rowChildren));
				}
			} else {
				grid.container.classList.add ('empty');

				elements.push (react.createElement ('div', {
					className: 'tch-grid-row'
				}, react.createElement ('div', {className: 'tch-grid-col center'}, grid.data.texts.noItems)));
			}

			grid.container.querySelector ('.tch-grid-body').innerHTML = reactDOMServer.renderToStaticMarkup (elements);
		},

		/**
		 * Render grid footer to elements.
		 */
		RenderFooter (grid) {
			let elements = [];

			if (grid.data.items.length > 0) {
				let rowChildren = [];

				let pageChildren = [];
				pageChildren.push (react.createElement ('span', {}, grid.data.texts.page));
				let selectPageChildren = [];
				for (let i = 1; i <= grid.data.pages; i++) {
					if (i === grid.data.page) {
						selectPageChildren.push (react.createElement ('option', {selected: true}, i));
					} else {
						selectPageChildren.push (react.createElement ('option', {}, i));
					}
				}
				pageChildren.push (react.createElement ('select', {}, selectPageChildren));
				rowChildren.push (react.createElement ('div', {className: 'tch-grid-page'}, pageChildren));

				let pageSizeChildren = [];
				pageSizeChildren.push (react.createElement ('span', {}, grid.data.texts.pageSize));
				let selectPageSizeChildren = [];
				for (let i = 0; i < grid.data.pageSizes.length; i++) {
					let size = grid.data.pageSizes [i];
					if (size === grid.data.pageSize) {
						selectPageSizeChildren.push (react.createElement ('option', {selected: true}, size));
					} else {
						selectPageSizeChildren.push (react.createElement ('option', {}, size));
					}
				}
				pageSizeChildren.push (react.createElement ('select', {}, selectPageSizeChildren));
				rowChildren.push (react.createElement ('div', {className: 'tch-grid-pagesize'}, pageSizeChildren));

				elements.push (react.createElement ('div', {
					className: 'tch-grid-row'
				}, react.createElement ('div', {className: 'tch-grid-col center'}, rowChildren)));
			}

			grid.container.querySelector ('.tch-grid-footer').innerHTML = reactDOMServer.renderToStaticMarkup (elements);
		},

		/**
		 * Add correct event listeners to grid actions.
		 */
		GridActions (grid, headerActions = false) {
			if (headerActions) {
				let sorts = grid.container.querySelectorAll ('.tch-grid-sort');
				if (sorts.length > 0) {
					for (let i = 0; i < sorts.length; i++) {
						(element => {
							element.addEventListener ('click', () => {
								this.ChangeSort (grid, element);
							});
						}) (sorts [i]);
					}
				}

				let filterSearches = grid.container.querySelectorAll ('.tch-grid-filter-search');
				if (filterSearches.length > 0) {
					for (let i = 0; i < filterSearches.length; i++) {
						(element => {
							element.addEventListener ('keyup', () => {
								this.FilterSearch (grid, element);
							});
							element.addEventListener ('change', () => {
								this.FilterSearch (grid, element);
							});
						}) (filterSearches [i]);
					}
				}
			}

			let rowActions = grid.container.querySelectorAll ('.tch-grid-action');
			if (rowActions.length > 0) {
				for (let i = 0; i < rowActions.length; i++) {
					(element => {
						element.addEventListener ('click', () => {
							this.ExecuteAction (grid, element.dataset.href, (element.dataset.confirm === 'true'));
						});
					}) (rowActions [i]);
				}
			}

			let page = grid.container.querySelector ('.tch-grid-page select');
			if (page !== null) {
				page.addEventListener ('change', () => {
					this.ChangePage (grid, page.value);
				});

				TCH.Select.Init (page);
			}

			let pageSize = grid.container.querySelector ('.tch-grid-pagesize select');
			if (pageSize !== null) {
				pageSize.addEventListener ('change', () => {
					this.ChangePageSize (grid, pageSize.value);
				});

				TCH.Select.Init (pageSize);
			}
		},

		/**
		 * Change current grid sort.
		 */
		ChangeSort (grid, element) {
			let index = element.dataset.index;

			if (index === grid.data.sort) {
				if (grid.data.sortDirection === 'ASC') {
					grid.data.sortDirection = 'DESC';
				} else {
					grid.data.sortDirection = 'ASC';
				}
			} else {
				grid.data.sort = index;
				grid.data.sortDirection = 'ASC';
			}

			let sorts = grid.container.querySelectorAll ('.tch-grid-sort');
			if (sorts.length > 0) {
				for (let i = 0; i < sorts.length; i++) {
					(element => {
						let icon = this.template.sortAsc;
						if (element.dataset.index === grid.data.sort && grid.data.sortDirection === 'ASC') {
							icon = this.template.sortDesc;
						}
						element.innerHTML = icon;
					}) (sorts [i]);
				}
			}

			this.UpdateData (grid, grid => {
				this.Render (grid);
			});
		},

		/**
		 * Filter grid items by search if changed since last.
		 */
		FilterSearch (grid, element) {
			let lastValue = '';
			if (typeof (element.dataset.lastValue) !== 'undefined') {
				lastValue = element.dataset.lastValue;
			}

			let value = element.value;
			if (value !== lastValue) {
				element.dataset.lastValue = value;

				if (typeof (grid.timeoutInProgress) !== 'undefined') {
					clearTimeout (grid.timeoutInProgress);
					delete grid.timeoutInProgress;
				}
				
				grid.timeoutInProgress = setTimeout (() => {
					if (value.length > 0) {
						grid.data.filter [element.dataset.index] = {
							value: value,
							condition: DatabaseWhereConditions.Like
						};
					} else if (typeof (grid.data.filter [element.dataset.index]) !== 'undefined') {
						delete grid.data.filter [element.dataset.index];
					}

					this.UpdateData (grid, grid => {
						this.Render (grid);
					});
				}, 200);
			}
		},

		/**
		 * Execute action on row.
		 */
		ExecuteAction (grid, href, confirm = false) {
			let action = () => {
				TCH.Main.Navigation.Load (href);
			};
			
			if (confirm) {
				TCH.Main.ConfirmAction.AskConfirmation (undefined, action);
			} else {
				action ();
			}
		},

		/**
		 * Change current grid page.
		 */
		ChangePage (grid, page) {
			grid.data.page = parseInt (page);

			if (grid.data.page <= 0) {
				grid.data.page = 1;
			} else if (grid.data.page > grid.data.pages) {
				grid.data.page = grid.data.pages;
			}

			this.UpdateData (grid, grid => {
				this.Render (grid);
			});
		},

		/**
		 * Change current grid pageSize.
		 */
		ChangePageSize (grid, pageSize) {
			grid.data.pageSize = parseInt (pageSize);

			if (grid.data.pageSize <= 0) {
				grid.data.pageSize = 1;
			}

			this.UpdateData (grid, grid => {
				this.Render (grid);
			});
		}
	};

	TCH.Grid.Init ();
}
