import Listener from "./listener.js"

/**
* @class
* `Observables` allow `Models` to communicate with each other and store their states.
*/
function Observable() {
	this._listeners = {}
}

/**
 * Subscribe and consume event of a given `Observable`.
 *
 * `Binding.listen` is preferred when inside a Binding.
 * @param  {string}   eventName
 * @param  {Function} callback
 * @param  {boolean}  [unshift=false]
 * @returns {Listener}
 * @example observable.listen("myEvent", message => { console.log(message) })
 */
Observable.prototype.listen = function(eventName, callback, unshift = false) {
	if(!Array.isArray(this._listeners[eventName])) {
		this._listeners[eventName] = []
	}
	const listener = new Listener(this, eventName, callback)
	if(unshift) {
		this._listeners[eventName].unshift(listener)
	} else {
		this._listeners[eventName].push(listener)
	}
	return listener
}

/**
 * Notify all `Listeners` of a given event
 * @param  {string} eventName
 * @param  {*} 			args
 * @example observable.emit("myEvent", "Hello World")
 */
Observable.prototype.emit = function(eventName) {
	if(Array.isArray(this._listeners[eventName])) {
		for (const listener of this._listeners[eventName].slice()) {
			listener.callback(...Array.from(arguments).slice(1))
		}
	} else {
		throw new Error(`Cannot emit the event '${eventName}' as there is no listener for this event.`)
	}
}

/**
 * @param  {Listener} listener
 */
Observable.prototype.removeListener = function(listener) {
	this._listeners[listener.eventName] = this._listeners[listener.eventName].filter(listener_ => listener_ !== listener)
}

export default Observable
