/**
 * @module core
 * @description
 * Core related methods
 *
 * @example
 * import { Core } from "domodel"
 */
import Binding from "./binding.js"

/**
 * @type {Method}
 */
export const METHOD = {
	APPEND_CHILD: "APPEND_CHILD",
	INSERT_BEFORE: "INSERT_BEFORE",
	INSERT_AFTER: "INSERT_AFTER",
	REPLACE_NODE: "REPLACE_NODE",
	WRAP_NODE: "WRAP_NODE",
	PREPEND: "PREPEND",
}

/**
* Create and connect a `Model` to the `DOM`
* @param {Model}                        model
* @param {RunParameters}                runParameters
* @returns {Element}
* @example Core.run({ tagName: "div" }, { target: document.body })
*/
export function run(model, runParameters) {
	const { target = runParameters.parentNode, binding = new Binding(), method = METHOD.APPEND_CHILD } = runParameters
	const element = createElement(target, model, binding)
	binding.root = element
	binding.model = model
	binding.onCreated()
	for (const name of getFunctionNames(binding.eventListener)) {
		binding.listen(binding.eventListener.observable, name, binding.eventListener[name].bind(binding), true)
	}
	connectElement(target, element, method, binding)
	return element
}

/**
	* Create an `Element` from a `Model`
	* @ignore
	* @param   {Element} target
	* @param   {Model}   model
	* @param   {Binding} binding
	* @returns {Element}
	*/
export function createElement(target, model, binding) {
	const { tagName, children = [], identifier, attributes, childModel, ...elementProperties } = model
	let element
	if(tagName) { // ElementDefinition
		element = target.ownerDocument.createElement(tagName)
		for(const elementProperty in elementProperties) {
			element[elementProperty] = model[elementProperty]
		}
		for(const attribute in attributes) {
			element.setAttribute(attribute, attributes[attribute])
		}
		if(identifier) {
			binding.identifier[identifier] = { element, model, binding }
			binding.elements[identifier] = element
		}
		for(const child of children) {
			const childElement = createElement(element, child, binding)
			element.appendChild(childElement)
		}
	} else if(childModel) { // ChildModelDefinition
		let childBinding
		if(childModel.binding) {
			childBinding = new childModel.binding(...(childModel.arguments || []))
		}
		element = binding.run(childModel.model, { target, binding: childBinding }, childBinding.identifier)
		if(childModel.identifier) {
			binding.identifier[childModel.identifier] = {
				element,
				model: childModel.model,
				binding: childBinding
			}
			binding.elements[childModel.identifier] = element
		}
	}
	return element
}

/**
	* @ignore
	* @param   {Element} target
	* @param   {Element} element
	* @param   {Method}  method
	* @param   {Binding} binding
	*/
function connectElement(target, element, method, binding) {
	if (method === METHOD.APPEND_CHILD) {
		target.appendChild(element)
	} else if (method === METHOD.INSERT_BEFORE) {
		target.before(element)
	} else if (method === METHOD.INSERT_AFTER) {
		target.after(element)
	} else if(method === METHOD.REPLACE_NODE) {
		target.replaceWith(element)
	} else if (method === METHOD.WRAP_NODE) {
		element.appendChild(target.cloneNode(true))
		target.replaceWith(element)
	} else if (method === METHOD.PREPEND) {
		target.prepend(element)
	}
	if(element.isConnected) {
		binding._onConnected()
	}
}

/**
 * @ignore
 * @param {object} obj
 * @returns {Array<string>}
 */
function getFunctionNames(obj) {
	const prototype = Object.getPrototypeOf(obj)
	return getPrototypeFunctionNames(prototype)
}

/**
 * @ignore
 * @param {object} obj
 * @returns {Array<string>}
 */
function getPrototypeFunctionNames(prototype) {
	const functionNames = new Set()
	const ownPropertyDescriptors = Object.getOwnPropertyDescriptors(prototype)
	for(const name in ownPropertyDescriptors) {
		if(name !== "constructor" && typeof ownPropertyDescriptors[name].value === "function")  {
			functionNames.add(name)
		}
	}
	const parentPrototype = Object.getPrototypeOf(prototype)
	if(Object.getPrototypeOf(parentPrototype)) {
		for(const functionName of getPrototypeFunctionNames(parentPrototype)) {
			functionNames.add(functionName)
		}
	}
	return functionNames
}

export default {
	run,
	METHOD
}

/**
 * @typedef  {(ElementDefinition|ChildModelDefinition)} Model - While a `Binding` defines the behavior of a component, a `Model` defines its look.
*/

/**
 * @typedef  {object}                                ElementDefinition                 - Create an Element
 * @property {tagName}                               tagName
 * @property {object}                                [attributes]                      - These will be set using setAttribute
 * @property {str}                                   [identifier]                      - Creates an identifier for this Element
 * @property {Array<Model>}                          [children]
*/

/**
 * @typedef  {object}                                ChildModelDefinition
 * @property {ChildModel}                            childModel
 */

/**
 * @typedef  {object}                                ChildModel                        - Full-featured nesting of model
 * @property {ElementDefinition}                     childModel.model
 * @property {Binding}                               childModel.binding                - Binding class
 * @property {array}                                 [childModel.arguments]            - These properties will be passed to the binding
 * @property {str}                                   [childModel.identifier]           - Creates an identifier for this ChildModel
 */

/**
 * @typedef  {object}                                RunParameters                     - Allow some degree of parameterization when running a Model
 * @property {Element}                               target
 * @property {Binding}                               [binding=new Binding()]
 * @property {Method}                                [method=METHOD.APPEND_CHILD]
 * @property {str}                                   [identifier]                      - Creates an identifier for this Model
 */



/**
	* @typedef {object} Method - Change how a model is connected to the DOM
	* @property APPEND_CHILD  {string}
	* @property INSERT_BEFORE {string}
	* @property INSERT_AFTER  {string}
	* @property REPLACE_NODE  {string}
	* @property WRAP_NODE     {string}
	* @property PREPEND       {string}
	*/
