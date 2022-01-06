/**
 * @global
 */
class definition {

	/**
	 * @param {object} definition
	 * @param {Binding} binding
	 * @param {object}  properties
	 */
	constructor(definition, binding, properties) {
		this._definition = definition
		this._binding = binding
		this._properties = properties
	}

	/**
	 * @readonly
	 * @type {object}
	 */
	get definition() {
		return this._definition
	}

	/**
	 * @readonly
	 * @type {object}
	 */
	get binding() {
		return this._binding
	}

	/**
	 * @readonly
	 * @type {object}
	 */
	get properties() {
		return this._properties
	}

}

export default definition
