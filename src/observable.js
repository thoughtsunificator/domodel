import Listener from "./listener.js"

/**
 * @global
 */
class Observable {

	constructor() {
		this._listeners = {}
	}

	/**
	 * @param  {string}   eventName
	 * @param  {Function} callback
	 * @param  {boolean}  [unshift=false]
	 * @returns {Listener}
	 * @example observable.listen("myEvent", message => { console.log(message) })
	 */
	listen(eventName, callback, unshift = false) {
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
	 * @param  {Listener} listener
	 */
	removeListener(listener) {
		this._listeners[listener.eventName] = this._listeners[listener.eventName].filter(listener_ => listener_ !== listener)
	}

	/**
	 * @param  {string} eventName
	 * @param  {*} 			args
	 * @example observable.emit("myEvent", "Hello World")
	 */
	emit(eventName) {
		if(Array.isArray(this._listeners[eventName])) {
			for (const listener of this._listeners[eventName].slice()) {
				listener.callback(...Array.from(arguments).slice(1))
			}
		} else {
			throw new Error(`Cannot emit the event '${eventName}' as there is no listener for this event.`)
		}
	}

}

export default Observable
