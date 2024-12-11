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
}

/**
 * Remove a listener
 */
Listener.prototype.remove = function() {
	this.observable.removeListener(this)
}

export default Listener
