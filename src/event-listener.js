/**
 * @global
 */
class EventListener {

	/**
	 * @param {Observable} observable
	 * @param {Binding} binding
	 */
	constructor(observable, binding) {
		this._observable = observable
		this._binding = binding
	}

	/**
	 * @type {Observable}
	 * @readonly
	 */
	get observable() {
		return this._observable
	}

	/**
	 * @type {Binding}
	 * @readonly
	 */
	get binding() {
		return this._binding
	}

}

export default EventListener
