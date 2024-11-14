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
		this._remoteEventListeners = []
	}

	/**
	 * @returns {Document}
	 */
	get document() {
		return this.root.ownerDocument
	}

	/**
	 * @returns {Window}
	 */
	get window() {
		return this.document.defaultView
	}

	/**
	 * Access any child nodes identified with the "identifier" property.
	 * @readonly
	 * @type {object}
	 */
	get identifier() {
		return this._identifier
	}

	/**
	 * @deprecated Use constructor arguments instead
	 * @readonly
	 * @type {object}
	 */
	get properties() {
		return this._properties
	}

	/**
	 * Root Element of this model
	 * @readonly
	 * @type {Element}
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
	 * Call onRendered on this Binding and all its children
	 */
	_onRendered() {
		this.onRendered()
		for(const childBinding of this._children) {
			childBinding._onRendered()
		}
	}

	/**
	 * @param {string}   eventName
	 * @param {Function} callback
	 * @param {boolean}  [unshift=false]
	 * @returns {Listener}
	 * @example binding.listen(observable, "myEvent", message => console.log(message))
	 */
	listen(observable, eventName, callback, unshift = false) {
		const listener = observable.listen(eventName, callback, unshift)
		if(unshift) {
			this._listeners.unshift(listener)
		} else {
			this._listeners.push(listener)
		}
		return listener
	}

	/**
	 * @param   {object}  model
	 * @param   {object}  properties
	 * @param   {Element} [properties.parentNode=this.root]
	 * @param   {Binding} properties.binding
	 * @param   {Method}  [properties.method=Core.METHOD.APPEND_CHILD]
	 * @param   {str}     [identifier]
	 * @example binding.run(Model, { binding: new Binding() })
	 */
	run(model, properties) {
		properties.binding._parent = this
		this._children.push(properties.binding)
		// TODO deprecate and remove Binding.properties
		properties.binding._properties = {
			...this.properties,
			...properties.binding.properties
		}
		const node = Core.run(model, { parentNode: this.root, ...properties })
		if(properties.identifier) {
			this.identifier[properties.identifier] = node
		}
	}

	/**
	 * Remove the model and all its children from the DOM and clean up any listener associated with them.
	 */
	remove() {
		const listeners = this._listeners.slice()
		for(const listener of listeners) {
			listener.remove()
		}
		const children = this._children.slice()
		for(const child of children) {
			child.remove()
		}
		for(const { target, type, listener } of this._remoteEventListeners)  {
			target.removeEventListener(type, listener)
		}
		if(this._parent !== null) {
			this._parent._children = this._parent._children.filter(child => child !== this)
		}
		if(this.root instanceof this.window.DocumentFragment) {
			for(const child of this.root.fragmentChildren) {
				child.remove()
			}
		} else {
			this.root.remove()
		}
	}

	/**
	 * Call addEventListener on a given Element while storing the listener for later removal
	 * Useful when setting up event listeners on a parent Element.
	 * @param {Element} target
	 * @param {string}  type
	 * @param {method}  listener
	 * @param {object}  options
	 */
	addEventListener(target, type, listener, options) {
		this._remoteEventListeners.push({ target, type, listener })
		target.addEventListener(type, listener, options)
	}

	/**
	 * Access any child nodes identified with the "identifier" property.
	 * @param {*} key
	 * @returns {Element}
	 */
	getIdentifier(key) {
		return this._identifier[key]
	}

	/**
	 * Called after the node is created but before the node is connected to the DOM
	 * @abstract
	 */
	onCreated() {

	}

	/**
	 * Called after the node is created and is connected to the DOM
	 * @abstract
	 */
	async onRendered() {

	}

}

export default Binding
