let Utils = {
	Object: {
		/**
		 * Filter object into new object for which elements fullfill condition.
		 */
		Filter (object, condition) {
			let newObject = {};

			for (let index in object) {
				if (object.hasOwnProperty (index)) {
					if (condition (object [index], index)) {
						newObject [index] = object [index];
					}
				}
			}

			return newObject;
		},

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

	Array: {
		/**
		 * Change array to Object using value as key.
		 */
		ToObject (array, index = 'id', singleValue = null) {
			return array.reduce ((obj, item) => {
				obj [item [index]] = singleValue !== null ? item [singleValue] : item;
				return obj;
			}, {});
		}
	}
};

module.exports = Utils;
