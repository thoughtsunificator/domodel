/** @module observable */

import Listener from "./listener.js"

/**
 * @memberof module:observable
 */
class Observable {

	constructor() {
		this._listeners = {}
	}

	/**
	 * @param  {string}   eventName
	 * @param  {Function} callback
	 * @returns {Listener}
	 */
	listen(eventName, callback) {
		if(!Array.isArray(this._listeners[eventName])) {
			this._listeners[eventName] = []
		}
		const listener = new Listener(this, eventName, callback)
		this._listeners[eventName].push(listener)
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
	 */
	async emit(eventName, args) {
		if(Array.isArray(this._listeners[eventName])) {
			for (const listener of this._listeners[eventName]) {
				await listener.callback(args)
			}
		}
	}

}

export default Observable
