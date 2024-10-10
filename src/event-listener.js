/**
 * An EventListener listen on any event of given Observable and will be the first called.
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
