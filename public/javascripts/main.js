/* eslint-disable no-console */
/* eslint-disable no-undef */
if (typeof (TCH) === 'undefined') {
	window.TCH = {};
}

if (typeof (TCH.Main) === 'undefined') {
	TCH.Main = {
		/**
		 * Main initialization.
		 */
		Init () {
			if (this.Cookies.Get ('tch-alpha-popup-seen') === null) {
				this.Popup.Show ('popup-alpha', {
					onHidden: () => {
						TCH.Main.Cookies.Set ('tch-alpha-popup-seen', '1', 24 * 60 * 60);
					}
				});
			}

			this.Frame.Init ();

			let flashes = document.getElementById ('flashes-supercontainer');
			if (flashes !== null) {
				setTimeout (() => {
					TweenMax.to (flashes, 0.4, {opacity: 0, height: 0, onComplete: () => {
						flashes.style.display = 'none';
					}});
				}, 5 * 1000);
			}

			this.Navigation.Init ();

			let selects = document.querySelectorAll ('select');
			if (selects.length > 0) {
				for (let i = 0; i < selects.length; i++) {
					selects [i].classList.add ('tch-select');
				}
			}

			this.Toggle.Init ();

			this.Utils.Init ();
		},

		Cookies: {
			/**
			 * Get cookie.
			 * @param {string} name Name of cookie to get
			 * @returns {null|string}
			 */
			Get (name) {
				name += '=';
				let decodedCookie = decodeURIComponent (document.cookie);
				decodedCookie = decodedCookie.split (';');
				for (let i = 0; i < decodedCookie.length; i++) {
					let row = decodedCookie [i].trim ();

					if (row.indexOf (name) === 0) {
						return row.substring (name.length, row.length);
					}
				}

				return null;
			},

			/**
			 * Set new cookie.
			 */
			Set (name, value, expirationInSeconds) {
				let date = new Date ();
				date.setTime (date.getTime () + (expirationInSeconds * 1000));
				document.cookie = name + '=' + value + '; expires=' + date.toUTCString () + '; path=/';
			},

			/**
			 * Remove cookie.
			 */
			Remove (name) {
				document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
			}
		},

		ConfirmAction: {
			element: null,

			/**
			 * Show popup asking user for action confirmation.
			 */
			AskConfirmation (element, action) {
				this.element = element;

				TCH.Main.Popup.Show ('popup-confirm', {
					beforeShow: () => {
						let popup = document.querySelector ('#popup-confirm .general-popup');
						popup.classList.add ('auto');
					},
					onHidden: confirmed => {
						if (confirmed) {
							action ();
						}

						let popup = document.querySelector ('#popup-confirm .general-popup');
						popup.classList.remove ('auto');
	
						this.element = null;
					}
				});
			}
		},

		Frame: {
			currentWindow: null,

			/**
			 * Frame initilization.
			 */
			Init () {
				this.currentWindow = require ('electron').remote.getCurrentWindow ();

				let minimize = document.getElementById ('titlebar-minimize');
				minimize.addEventListener ('click', () => {
					this.currentWindow.minimize ();

					setTimeout (() => {
						minimize.blur ();
					}, 1);
				});

				let maximize = document.getElementById ('titlebar-maximize');
				if (this.currentWindow.isMaximized ()) {
					maximize.classList.add ('minimize');
				} else {
					maximize.classList.remove ('minimize');
				}
				maximize.addEventListener ('click', () => {
					if (this.currentWindow.isMaximized ()) {
						this.currentWindow.unmaximize ();
						maximize.classList.remove ('minimize');
					} else {
						this.currentWindow.maximize ();
						maximize.classList.add ('minimize');
					}

					setTimeout (() => {
						maximize.blur ();
					}, 1);
				});

				let close = document.getElementById ('titlebar-close');
				close.addEventListener ('click', () => {
					this.currentWindow.close ();

					setTimeout (() => {
						close.blur ();
					}, 1);
				});
			}
		},

		Navigation: {
			ajaxInProgress: null,

			/**
			 * Navigation initialization.
			 */
			Init () {
				let self = this;

				let links = document.querySelectorAll ('a');
				links = Array.from (links).filter (link => !link.classList.contains ('js-navigation-ignore'));
				for (let index in links) {
					links [index].addEventListener ('click', function () {
						event.preventDefault ();
						
						self.Load (this.href);
					});
				}

				let forms = document.querySelectorAll ('form');
				forms = Array.from (forms).filter (form => !form.classList.contains ('js-navigation-ignore'));
				for (let index in forms) {
					forms [index].addEventListener ('submit', function () {
						event.preventDefault ();
						
						self.SubmitForm (this);
					});
				}
			},

			/**
			 * Load new view by ajax.
			 */
			Load (url) {
				if (this.ajaxInProgress !== null) {
					this.ajaxInProgress.abort ();
					this.ajaxInProgress = null;
				}

				this.ajaxInProgress = new XMLHttpRequest ();
				this.ajaxInProgress.addEventListener ('load', this.Loaded.bind (this));
				this.ajaxInProgress.addEventListener ('error', () => {
					console.error (this.ajaxInProgress);
				});
				this.ajaxInProgress.open ('GET', url);
				this.ajaxInProgress.send ();
			},

			/**
			 * Load form submit by ajax.
			 */
			SubmitForm (form) {
				if (this.ajaxInProgress !== null) {
					this.ajaxInProgress.abort ();
					this.ajaxInProgress = null;
				}

				let formData = new FormData (form);

				this.ajaxInProgress = new XMLHttpRequest ();
				this.ajaxInProgress.addEventListener ('load', this.Loaded.bind (this));
				this.ajaxInProgress.addEventListener ('error', () => {
					console.error (this.ajaxInProgress);
				});
				this.ajaxInProgress.open (form.method || 'GET', form.action);
				this.ajaxInProgress.send (formData);
			},

			/**
			 * Handle ajax loaded event.
			 */
			Loaded () {
				let content = document.getElementById ('content');
				let height = content.offsetHeight;
				let animationSpeed = 0.4;

				content.style.overflow = 'hidden';

				TweenMax.to (content, animationSpeed, {height: 0, opacity: 0, onComplete: () => {
					let html = document.createElement ('html');
					html.innerHTML = this.ajaxInProgress.responseText;

					let htmlClasses = this.ajaxInProgress.responseText.split ('>');
					htmlClasses.shift ();
					htmlClasses = htmlClasses.shift ();
					htmlClasses = htmlClasses.split ('"');
					htmlClasses.shift ();
					htmlClasses = htmlClasses.shift ();
					document.querySelector ('html').classList.value = htmlClasses;

					let title = html.querySelector ('title');
					let body = html.querySelector ('body');
					
					document.querySelector ('title').innerHTML = title.innerHTML;
					document.querySelector ('#title').innerHTML = title.innerHTML;

					if (this.ajaxInProgress.status === 200) {
						document.querySelector ('body').innerHTML = body.innerHTML;
					} else {
						document.querySelector ('#content').innerHTML = body.innerHTML;
					}

					for (let index in TCH) {
						if (typeof (TCH [index].Init) === 'function') {
							TCH [index].Init ();
						}
					}

					content = document.getElementById ('content');
					height = content.offsetHeight;
					
					content.style.overflow = 'hidden';
					content.style.height = 0;
					content.style.opacity = 0;

					TweenMax.to (content, animationSpeed, {height: height, opacity: 1, onComplete: () => {
						content.style.overflow = '';
						content.style.height = '';
						content.style.opacity = '';

						history.pushState ({}, document.querySelector ('title').innerHTML, this.ajaxInProgress.responseURL);
					}});
				}});
			}
		},

		Popup: {
			/**
			 * Show correct popup.
			 */
			Show (id, params = { beforeShow: undefined, onShown: undefined, onHidden: undefined }) {
				let popupContainer = document.getElementById (id);

				if (popupContainer != null) {
					popupContainer.style.display = 'flex';

					let popup = popupContainer.querySelector ('.general-popup');
					popup.style.opacity = 0;

					if (typeof (params.beforeShow) === 'function') {
						params.beforeShow ();
					}

					TweenMax.to (popup, 0.4, {opacity: 1, onComplete: params.onShown});

					let close = popupContainer.querySelectorAll ('.general-popup-close');
					if (close.length > 0) {
						for (let i = 0; i < close.length; i++) {
							if (!close [i].classList.contains ('general-popup-close-initialized')) {
								((closeOne, id, params) => {
									closeOne.addEventListener ('click', () => {
										event.preventDefault ();
										TCH.Main.Popup.Hide (id, params);
									});

									closeOne.classList.add ('general-popup-close-initialized');
								}) (close [i], id, params);
							}
						}
					}

					let confirm = popupContainer.querySelector ('.general-popup-confirm');
					if (confirm !== null) {
						confirm.addEventListener ('click', () => {
							event.preventDefault ();
							TCH.Main.Popup.Hide (id, params, true);
						});
					}
				}
			},

			/**
			 * Hide correct popup.
			 */
			Hide (id, params, confirmed = false) {
				let popupContainer = document.getElementById (id);

				if (popupContainer != null) {
					let popup = popupContainer.querySelector ('.general-popup');

					TweenMax.to (popup, 0.4, {opacity: 0, onComplete: () => {
						popupContainer.style.display = 'none';

						if (typeof (params.onHidden) === 'function') {
							params.onHidden (confirmed);
						}
					}});
				}
			}
		},

		Toggle: {
			list: [],

			/**
			 * Toggle initialization.
			 */
			Init () {
				this.list = [];

				let list = document.querySelectorAll ('.tch-toggle');
				if (list.length > 0) {
					for (let i = 0; i < list.length; i++) {
						this.list.push ({
							container: list [i],
							buttons: list [i].querySelectorAll ('button'),
							multiple: typeof (list [i].dataset.multiple) !== 'undefined' && list [i].dataset.multiple === 'true',
							enlarge: typeof (list [i].dataset.enlarge) !== 'undefined' && list [i].dataset.enlarge === 'true',
							startHidden: true
						});

						(toggle => {
							for (let j = 0; j < toggle.buttons.length; j++) {
								toggle.buttons [j].addEventListener ('click', () => {
									this.Toggle (toggle);
								});
							}

							if (toggle.startHidden) {
								for (let j = 0; j < toggle.buttons.length; j++) {
									if (!toggle.buttons [j].classList.contains ('active')) {
										let target = document.querySelector (toggle.buttons [j].dataset.selector);
										target.style.display = 'none';
									}
								}
							}

							this.Enlarge (toggle);

							if (toggle.enlarge) {
								window.addEventListener ('resize', () => {
									this.Enlarge (toggle);
								});
							}
						}) (this.list [i]);
					}
				}
			},

			/**
			 * Toggle button clicked, process action.
			 */
			Toggle (toggle) {
				let button = event.target;
				
				if (typeof (button.dataset.selector) !== 'undefined') {
					let target = document.querySelector (button.dataset.selector);

					let hideAction = (_button, _target) => {
						_button.classList.remove ('active');
						_target.classList.remove ('active');

						_target.style.overflow = 'hidden';

						let params = {height: 0, opacity: 0, onComplete: () => {
							_target.style.overflow = '';
							_target.style.height = '';
							_target.style.opacity = '';

							_target.style ['flex-basis'] = '';
							_target.style ['max-width'] = '';

							_target.style.display = 'none';
						}};

						if (_target.classList.contains ('enlarged')) {
							_target.classList.remove ('enlarged');

							params ['flex-basis'] = _target.dataset.flexBasis;
							params ['max-width'] = _target.dataset.maxWidth;
						}

						TweenMax.to (_target, 0.4, params);
					};

					if (!toggle.multiple) {
						for (let i = 0; i < toggle.buttons.length; i++) {
							if (toggle.buttons [i] !== button && typeof (toggle.buttons [i].dataset.selector) !== 'undefined') {
								let _target = document.querySelector (toggle.buttons [i].dataset.selector);

								if (_target.classList.contains ('active')) {
									hideAction (toggle.buttons [i], _target);
								}
							}
						}
					}

					if (target.classList.contains ('active') && toggle.multiple) {
						hideAction (button, target);
					} else if (!target.classList.contains ('active')) {
						button.classList.add ('active');
						target.classList.add ('active');

						target.style.overflow = 'hidden';
						target.style.display = 'block';

						let height = target.offsetHeight;

						target.style.height = 0;
						target.style.opacity = 0;

						TweenMax.to (target, 0.4, {height: height, opacity: 1});

						if (toggle.multiple) {
							let activeButtons = TCH.Main.Utils.FilterNodeList (toggle.buttons, 'active');

							if (activeButtons.length > 1) {
								for (let i = 0; i < activeButtons.length; i++) {
									if (typeof (activeButtons [i].dataset.selector) !== 'undefined') {
										let _target = document.querySelector (activeButtons [i].dataset.selector);

										if (_target.classList.contains ('enlarged')) {
											_target.classList.remove ('enlarged');

											TweenMax.to (_target, 0.4, {'flex-basis': _target.dataset.flexBasis, 'max-width': _target.dataset.maxWidth, onComplete: () => {
												_target.style ['flex-basis'] = '';
												_target.style ['max-width'] = '';
											}});
										}
									}
								}
							}
						}
					}

					this.Enlarge (toggle);
				}
			},

			/**
			 * If enlarge is active and there is only one, do it.
			 */
			Enlarge (toggle) {
				if (toggle.enlarge) {
					let activeButtons = TCH.Main.Utils.FilterNodeList (toggle.buttons, 'active');

					if (activeButtons.length === 1 && typeof (activeButtons [0].dataset.selector) !== 'undefined') {
						let target = document.querySelector (activeButtons [0].dataset.selector);
						
						let targetCss = getComputedStyle (target);
						let widthPercentage = parseFloat (targetCss.maxWidth);

						if (widthPercentage < 100) {
							target.classList.add ('enlarged');

							target.dataset ['flexBasis'] = targetCss ['flex-basis'];
							target.dataset ['maxWidth'] = targetCss ['max-width'];

							TweenMax.to (target, 0.4, {'flex-basis': '100%', 'max-width': '100%'});
						}
					}
				}
			}
		},

		Utils: {
			/**
			 * Utils initialization.
			 */
			Init () {
				let equalMinHeights = document.querySelectorAll ('.tch-utils-equalMinHeights');
				if (equalMinHeights.length > 0) {
					window.addEventListener ('resize', this.EqualMinHeights.bind (this));
					this.EqualMinHeights ();
				}
			},

			/**
			 * Make sure that all children of parents are of equal min height.
			 */
			EqualMinHeights () {
				let parents = document.querySelectorAll ('.tch-utils-equalMinHeights');

				for (let i = 0; i < parents.length; i++) {
					(function (parent) {
						let children = parent.querySelectorAll ('.tch-utils-equalMinHeights-child');

						let topHeight = 0;
						for (let index in children) {
							if (children.hasOwnProperty (index)) {
								children [index].style ['min-height'] = '1px';

								if (children [index].offsetHeight > topHeight) {
									topHeight = children [index].offsetHeight;
								}
							}
						}

						for (let index in children) {
							if (children.hasOwnProperty (index)) {
								children [index].style ['min-height'] = `${topHeight}px`;
							}
						}
					}) (parents [i]);
				}
			},

			/**
			 * Filter NodeList just like array.
			 */
			FilterNodeList (nodeList, className) {
				let newArray = [];

				for (let i = 0; i < nodeList.length; i++) {
					if (nodeList [i].classList.contains (className)) {
						newArray.push (nodeList [i]);
					}
				}

				return newArray;
			},

			/**
			 * Find closest parent node with class or tag name for element.
			 * @param {Element} element Element from which to search parent
			 * @param {string} parentClass Class of searched for parent
			 * @returns {null|Element}
			 */
			FindNearestParent (element, parentClass, tagName) {
				let parent = element.parentElement;

				do {
					if (parent !== null && (typeof (parentClass) !== 'undefined' && parent.classList.contains (parentClass))) {
						return parent;
					} else if (parent !== null && (typeof (tagName) !== 'undefined' && parent.tagName === tagName)) {
						return parent;
					}

					parent = parent !== null ? parent.parentElement : null;
				} while (parent !== null);

				return null;
			},

			Object: {
				/**
				 * Check if object is empty (no elements).
				 * @param {object} object Object to check is empty
				 * @returns {boolean}
				 */
				IsEmpty (object) {
					for (let index in object) {
						if (object.hasOwnProperty (index)) {
							return false;
						}
					}

					return true;
				}
			},

			Select: {
				/**
				 * Return selected value/s for select.
				 */
				Values (select) {
					let values = select.selectedOptions;

					if (values.length > 0) {
						values = Array.from (values).map (element => {
							return element.value;
						});

						return values;
					}
					
					return select.value;
				}
			}
		}
	};

	TCH.Main.Init ();
}
