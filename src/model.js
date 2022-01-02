/**
 * @global
 */
class Model {

	/**
	 * @param {object} model
	 * @param {Binding} binding
	 */
	constructor(model, binding) {
		this._model = model
		this._binding = binding
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

}

export default Model
