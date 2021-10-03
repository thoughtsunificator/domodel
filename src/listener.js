/**
 * @global
 */
class Listener {

	/**
	 * @param   {Observable}   observable
	 * @param   {string}       eventName
	 * @param   {Function}     callback
	 */
	constructor(observable, eventName, callback) {
		this._observable = observable
		this._eventName = eventName
		this._callback = callback
	}

	/**
	 * Remove listener
	 */
	remove() {
		this._observable.removeListener(this)
	}

	/**
	 * @readonly
	 * @type {string}
	 */
	get eventName() {
		return this._eventName
	}

	/**
	 * @readonly
	 * @type {Function}
	 */
	get callback() {
		return this._callback
	}


}

export default Listener
