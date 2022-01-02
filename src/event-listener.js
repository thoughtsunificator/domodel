/**
 * @global
 */
class EventListener {

	/**
	 * @param {Observable} observable
	 */
	constructor(observable) {
		this._observable = observable
	}

	/**
	 * @type {Observable}
	 * @readonly
	 */
	get observable() {
		return this._observable
	}

}

export default EventListener
