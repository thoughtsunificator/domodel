/** @module event-listener */

/**
	* @memberof: module:event-listener
	*/
class EventListener {

	/**
	 * @param {Observable} observable
	 */
	constructor(observable) {
		this._observable = observable
		this._binding = null
	}

	/**
	 * @type {Observable}
	 */
	get observable() {
		return this._observable
	}

	/**
	 * @type {Binding}
	 */
	get binding() {
		return this._binding
	}

}

export default EventListener
