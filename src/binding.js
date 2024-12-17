import Core from "./core.js"
import EventListener from "./event-listener.js"
import Observable from "./observable.js"

/**
* @class
* While a `Model` defines the outlook of a component, a `Binding` defines its behavior.
* @param {EventListener} [eventListener=new EventListener(new Observable())]
*/
function Binding(eventListener = new EventListener(new Observable())) {
	/**
	 * Access any child Model identified with the "identifier" property.
	 * Any identifier returns a Binding instance
	 * @type {object}
	 */
	this.identifier = {}
	/**
	 * This is a shortcut to this.identifier["foo"].element
	 * Access any child Model's element identified with the "identifier" property.
	 * Any identifier returns an Element
	 * @type {object}
	 */
	this.elements = {}
	/**
	 * Parent Binding
	 * @type {Binding}
	 */
	this.parent = null
	/** @type {Element} */
	this.root = null
	/** @type {Model} */
	this.model = null
	/**
	 * List of child Binding
	 * @type {Array<ChildBinding>}
	 */
	this.children = []
	/**
	 * Listener register
	 * @ignore @type {Array<Listener>}
	 */
	this.listeners = []
	/** @ignore @type {EventListener} */
	this.eventListener = eventListener
	/** @ignore Used to track listeners on remote foreign Element */
	this.remoteEventListeners = []
	/**
	 * Observable register
	 * @type {Map}
	 */
	this._observables = new Map()
}



/**
 * @ignore
 * Call `onConnected` on this Binding and all its children
 */
Binding.prototype._onConnected = function() {
	this.onConnected()
	for(const { binding } of this.children) {
		binding._onConnected()
	}
}

/**
 * Alias for `Observable.listen`, the listeners are also stored
 * for later removal.
 * @param {*}          target
 * @param {string}     eventName
 * @param {Function}   callback
 * @param {boolean}    [unshift=false]
 * @returns {Listener}
 * @example binding.listen(observable, "myEvent", message => console.log(message))
 */
Binding.prototype.listen = function(target, eventName, callback, unshift = false) {
	let listener
	if(target instanceof Observable) {
		listener = target.listen(eventName, callback, unshift)
	} else {
		/**
		 * New feature
		 * This allows to listen to any object not just an Observable
		 */
		if(!this.observables.has(target)) {
			this.observables.set(target, new Observable())
		}
		listener = this.observables.get(target).listen(eventName, callback, unshift)
	}
	if(unshift) {
		this.listeners.unshift(listener)
	} else {
		this.listeners.push(listener)
	}
	return listener
}

/**
 *
 * @param {*} target
 */
Binding.prototype.emit = function(target, ...emitArgument) {
	const observable = this.observables.get(target)
	observable.emit(...emitArgument)
}

/**
 * Alias for `Core.run`, except that the target is pre-configured to
 * be the current `Binding`'s root `Element`. Allows identification and hierarchization
 * of `Models` inside the current Binding.
 * @param   {Model}         model
 * @param   {RunParameters} runParameters
 * @param   {str}           identifier
 * @returns {Element}
 * @example binding.run(Model, { binding: new Binding() })
 */
Binding.prototype.run = function(model, runParameters) {
	const { identifier, binding = new Binding() } = runParameters
	binding.parent = this
	this.children.push({ model, binding: binding, identifier })
	const element = Core.run(model, { target: runParameters.target || this.root, ...runParameters })
	if(identifier) {
		this.identifier[identifier] = { element, model: runParameters.model, binding: binding }
		this.elements[identifier] = element
	}
	return element
}

/**
 * Remove the associated `Model` and all its children from the DOM
 * and clean up any `DOM` `Event` or `Observable` listeners associated with them.
 */
Binding.prototype.remove = function() {
	for(const { target, type, listener, options } of this.remoteEventListeners)  {
		target.removeEventListener(type, listener, options)
	}
	this.remoteEventListeners = []
	const listeners = this.listeners.slice()
	for(const listener of listeners) {
		listener.remove()
	}
	const children = this.children.slice()
	for(const { binding } of children) {
		binding.remove()
	}
	if(this.parent !== null) {
		this.parent.children = this.parent.children.filter(child => child !== this)
	}
	this.root.remove()
}

/**
 * Store an `DOM` event listener for later removal.
 *
 * It can be used to store event listeners on foreign `Element` such as `Window`.
 * @param {Element} target
 * @param {string}  type
 * @param {method}  listener
 * @param {object}  options
 */
Binding.prototype.addEventListener = function(target, type, listener, options) {
	this.remoteEventListeners.push({ target, type, listener, options })
	target.addEventListener(type, listener, options)
}

/**
 * This hook is called after the `Element` is created but before the Element is connected to the `DOM`
 * @abstract
 */
Binding.prototype.onCreated = function() {}

/**
 * This hook is called after the `Element` is created and is connected to the `DOM`
 * @abstract
 */
Binding.prototype.onConnected = function() {}

/** Binding.document */
Object.defineProperty(Binding.prototype, "document", {
	get: function() {
		return this.root.ownerDocument
	}
})

/** Binding.window */
Object.defineProperty(Binding.prototype, "window", {
	get: function() {
		return this.document.defaultView
	}
})

/** Binding.observables */
Object.defineProperty(Binding.prototype, "observables", {
	get: function() {
		if(this.parent) {
			return this.parent.observables
		} else {
			return this._observables
		}
	}
})

export default Binding

/**
 * @typedef {import("./core.js").Model} Model
 * @typedef {import("./core.js").RunParameters} RunParameters
 * @typedef {import("./listener.js").default} Listener
 */

/**
 * @memberof Binding
 * @typedef  {object}                                ChildBinding
 * @property {ElementDefinition}                     childModel.model
 * @property {Binding}                               childModel.binding
 * @property {str}                                   [childModel.identifier]
 */

/**
 * @name Binding#window
 * @type {Window}
 */

/**
 * @name Binding#document
 * @type {Document}
 */
