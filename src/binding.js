/** @module binding */

import Core from "./core.js"

class Binding {

	/**
	 * @param {object} properties
	 */
	constructor(properties) {
		this._identifier = {}
		this._properties = {...properties}
		this._parent = null
		this._children = []
		this._listeners = []
	}

	/**
	 * @return {object}
	 */
	get identifier() {
		return this._identifier
	}

	/**
	 * @return {object}
	 */
	get properties() {
		return this._properties
	}

	/**
	 * @return {Node}
	 */
	get root() {
		return this._root
	}

	/**
	 * @param  {string}   eventName
	 * @param  {Function} callback
	 * @returns {Listener}
	 */
	listen(observable, eventName, callback) {
		const listener = observable.listen(eventName, callback)
		this._listeners.push(listener)
		return listener
	}

	run(model, properties) {
		properties.binding._parent = this
		this._children.push(properties.binding)
		properties.binding._properties = {
			...this.properties,
			...properties.binding.properties
		}
		Core.run(model, { parentNode: this.root, ...properties })
	}

	remove() {
		const listeners = this._listeners.slice()
		for(const listener of listeners) {
			listener.remove()
		}
		const children = this._children.slice()
		for(const child of children) {
			child.remove()
		}
		if(this._parent !== null) {
			this._parent._children = this._parent._children.filter(child => child !== this)
		}
		this.root.remove()
	}

	/**
		* @abstract
		*/
	onCreated() {

	}

	/**
		* @abstract
		*/
	async onRendered() {

	}

}

export default Binding
