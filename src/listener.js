/**
 * @class
 * @param {Observable}   observable
 * @param {string}       eventName
 * @param {Function}     callback
 */
function Listener(observable, eventName, callback) {
	this.observable = observable
	this.eventName = eventName
	this.callback = callback
	/**
	 * Non observable listener need their target referenced
	 * for clean up purposes.
	 * @type {*}
	 */
	this.secondaryTarget = null
}

/**
 * Remove a listener
 */
Listener.prototype.remove = function() {
	this.observable.removeListener(this)
}

export default Listener
