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
	this.identifiedAs = null
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
	 * @type {Map<Observable>}
	 */
	this._observables = new Map()
	this.connected = false
}



/**
 * @ignore
 * Call `onConnected` on this Binding and all its children
 */
Binding.prototype._onConnected = function() {
	this.connected = true
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
 * Note: When listening on a non-Observable target, the Binding take care of mapping the listener to a given target. This mapping is inherited by all children which means that children are able to emit to any non-Observable target Listener of any parent.
 */
Binding.prototype.listen = function(target, eventName, callback, unshift = false) {
	let listener
	if(target instanceof Observable) {
		listener = target.listen(eventName, callback, unshift)
	} else {
		/**
		 * This enables listening of non-Observable targets
		 */
		if(!this.observables.has(target)) {
			this.observables.set(target, new Observable())
		}
		listener = this.observables.get(target).listen(eventName, callback, unshift)
		listener.secondaryTarget = target
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
	if(observable) {
		observable.emit(...emitArgument)
	} else {
		throw new Error("No listener were found on this Binding for this Observable")
	}
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
	const child = { model, binding: binding, identifier }
	this.children.push(child)
	const element = Core.run(model, { target: runParameters.target || this.root, ...runParameters })
	if(identifier) {
		this.identifier[identifier] = { element, model: runParameters.model, binding: binding }
		this.elements[identifier] = element
		binding.identifiedAs = identifier
	}
	return element
}

Binding.prototype.getChildByObservable = function(observable) {
	const child = this.children.find(child => child.binding.eventListener.observable === observable)
	if(!child) {
		throw new Error("Unable to find any child matching the given Observable.")
	}
	return child
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
		if(listener.secondaryTarget) {
			if(this.observables.get(listener.secondaryTarget)._listeners.size === 0) {
				this.observables.delete(listener.secondaryTarget)
			}
		}
	}
	const children = this.children.slice()
	for(const { binding } of children) {
		binding.remove()
	}
	if(this.parent !== null) {
		this.parent.children = this.parent.children.filter(child => child.binding !== this)
		if(this.identifiedAs) {
			delete this.parent.elements[this.identifiedAs]
			delete this.parent.identifier[this.identifiedAs]
		}
	}
	/**
	 * The following are cleared even though the Binding will probably be GC
	 * That's because someone the life cycle of a Binding is not necessarily
	 * tighly coupled with its root element, Binding.remove might get called multiple
	 * times if a Binding is poorly setup, this will cause an error which will make
	 * things more obvious than silently failing. This can also happen when a Binding
	 * is removed as part of a chain of events that causes remove to be call twice for example.
	 */
	this.listeners = []
	this.elements = {}
	this.identifier = {}
	this.root.remove()
	this.connected = false
	this.root = null
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
