/**
 * @global
 */
class Model {

	/**
	 * @param {object} model
	 * @param {Binding} binding
	 * @param {object}  properties
	 */
	constructor(model, binding, properties) {
		this._model = model
		this._binding = binding
		this._properties = properties
	}

	/**
	 * @readonly
	 * @type {object}
	 */
	get model() {
		return this._model
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

export default Model
