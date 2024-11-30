/**
 * An EventListener listen on any event of given Observable and will be the first called.
 * @global
 */
class EventListener {

	/**
	 * @param {Observable} observable
	 */
	constructor(observable) {
		this.observable = observable
	}

}

export default EventListener
