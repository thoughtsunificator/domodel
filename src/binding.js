import Core from "./core.js"
import EventListener from "./event-listener.js"
import Observable from "./observable.js"

/**
 * @global
 */
class Binding {

	/**
	 * @param {object} properties
	 * @param {EventListener} [eventListener=new EventListener(new Observable())]
	 */
	constructor(properties, eventListener = new EventListener(new Observable())) {
		this._identifier = {}
		this._properties = { ...properties }
		this._parent = null
		this._root = null
		this._model = null
		this._children = []
		this._listeners = []
		this._eventListener = eventListener
		this._eventListener._binding = this
	}

	/**
	 * @readonly
	 * @type {object}
	 */
	get identifier() {
		return this._identifier
	}

	/**
	 * @readonly
	 * @type {object}
	 */
	get properties() {
		return this._properties
	}

	/**
	 * @readonly
	 * @type {Node}
	 */
	get root() {
		return this._root
	}

	/**
	 * @readonly
	 * @type {object}
	 */
	get model() {
		return this._model
	}

	/**
	 * @readonly
	 * @type {EventListener}
	 */
	get eventListener() {
		return this._eventListener
	}

	/**
	 * @param   {string}   eventName
	 * @param   {Function} callback
	 * @returns {Listener}
	 * @example binding.listen(observable, "myEvent", message => console.log(message))
	 */
	listen(observable, eventName, callback) {
		const listener = observable.listen(eventName, callback)
		this._listeners.push(listener)
		return listener
	}

	/**
	 * @param   {object}  model
	 * @param   {object}  properties
	 * @param   {Element} [properties.parentNode=this.root]
	 * @param   {Binding} properties.binding
	 * @param   {Method}  [properties.method=Core.METHOD.APPEND_CHILD]
	 * @example binding.run(Model, { binding: new Binding() })
	 */
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
