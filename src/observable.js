import Listener from "./listener.js"

/**
* @class
* `Observables` allow `Models` to communicate with each other and store their states.
*/
function Observable() {
	this._listeners = new Map()
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
	if(!this._listeners.has(eventName)) {
		this._listeners.set(eventName, [])
	}
	const listener = new Listener(this, eventName, callback)
	if(unshift) {
		this._listeners.get(eventName).unshift(listener)
	} else {
		this._listeners.get(eventName).push(listener)
	}
	return listener
}

/**
 * Notify all `Listeners` of a given event
 * @param  {string} eventName
 * @param  {*} 			args
 * @example observable.emit("myEvent", "Hello World")
 */
Observable.prototype.emit = function(eventName, ...eventArgs) {
	if(this._listeners.has(eventName)) {
		for (const listener of this._listeners.get(eventName).slice()) {
			listener.callback(...eventArgs)
		}
	} else {
		throw new Error(`Cannot emit the event '${eventName}' as there is no listener for this event.`)
	}
}

/**
 * @param  {Listener} listener
 */
Observable.prototype.removeListener = function(listener) {
	const listeners = this._listeners.get(listener.eventName)
	listeners.splice(listeners.indexOf(listener), 1)
	if(listeners.length === 0) {
		this._listeners.delete(listener.eventName)
	}
}

export default Observable
