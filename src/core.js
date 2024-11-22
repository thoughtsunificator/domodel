import Binding from "./binding.js"
// eslint-disable-next-line no-unused-vars
import ModelChain from "./model-chain.js"

/**
 * @global
 */
class Core {

	/**
	 * Reserved properties
	 * These properties will not be processed at the DOM level
	 * @readonly
	 */
	static PROPERTIES = [
		"tagName",
		"children",
		"identifier",
		"model",
		"binding",
		"properties"
	]

	/**
		* @readonly
		* @property Method {Method}
		* @property Method.APPEND_CHILD  {string}
		* @property Method.INSERT_BEFORE {string}
		* @property Method.INSERT_AFTER  {string}
		* @property Method.REPLACE_NODE  {string}
		* @property Method.WRAP_NODE     {string}
		* @property Method.PREPEND       {string}
		* @example Core.Method.APPEND_CHILD
		*/
	static METHOD = {
		APPEND_CHILD: "APPEND_CHILD",
		INSERT_BEFORE: "INSERT_BEFORE",
		INSERT_AFTER: "INSERT_AFTER",
		REPLACE_NODE: "REPLACE_NODE",
		WRAP_NODE: "WRAP_NODE",
		PREPEND: "PREPEND",
	}

	/**
		* @param {Object|ModelChain} model
		* @param {Object}            properties
		* @param {Element}           properties.parentNode
		* @param {Binding}           [properties.binding=new Binding()]
		* @param {Method}            [properties.method=Core.METHOD.APPEND_CHILD]
		* @returns {Element}
		* @example Core.run(Model, { parentNode: document.body })
		*/
	static run(model, { parentNode, binding = new Binding(), method = Core.METHOD.APPEND_CHILD } = {}) {
		let modelDefinition
		if(model instanceof ModelChain) {
			modelDefinition = model.definition
		} else {
			modelDefinition = model
		}
		const node = Core.createElement(parentNode, modelDefinition, binding)
		binding._root = node
		binding._model = model
		for (const name of getFunctionNames(binding.eventListener)) {
			binding.listen(binding.eventListener.observable, name, binding.eventListener[name].bind(binding), true)
		}
		if(node instanceof node.ownerDocument.defaultView.DocumentFragment) {
			/**
			 * When binding root's element is a DocumentFragment its children need to be referenced
			 * so that they are removed when Binding.remove is called.
			*/
			node.domodel.fragmentChildren = [...node.children]
		}
		if(node instanceof node.ownerDocument.defaultView.DocumentFragment && node.domodel.identifier) {
			binding.identifier[node.domodel.identifier] = parentNode
		}
		binding.onCreated()
		const isPlaceholderDocumentFragment = parentNode.nodeType === node.ownerDocument.defaultView.Node.COMMENT_NODE
		if(isPlaceholderDocumentFragment) {
			if(parentNode.domodel?.placeholderNode) {
				parentNode.domodel.placeholderNode.after(node)
			} else {
				parentNode.replaceWith(node)
			}
			parentNode.domodel.placeholderNode = node
		} else if (method === Core.METHOD.APPEND_CHILD) {
			parentNode.appendChild(node)
		} else if (method === Core.METHOD.INSERT_BEFORE) {
			parentNode.before(node)
		} else if (method === Core.METHOD.INSERT_AFTER) {
			parentNode.after(node)
		} else if(method === Core.METHOD.REPLACE_NODE) {
			parentNode.replaceWith(node)
		} else if (method === Core.METHOD.WRAP_NODE) {
			node.appendChild(parentNode.cloneNode(true))
			parentNode.replaceWith(node)
		} else if (method === Core.METHOD.PREPEND) {
			parentNode.prepend(node)
		}
		if(!isPlaceholderDocumentFragment && node.isConnected) {
			binding._onRendered()
		}
		return node
	}

	/**
	  * Create an element from a model definition
		* @ignore
		* @param   {Object} Node
		* @param   {Object} modelDefinition
		* @param   {Object} Binding
		* @returns {Element}
		*/
	static createElement(parentNode, modelDefinition, binding) {
		const { tagName, children = [] } = modelDefinition
		let node
		if(tagName) {
			node = parentNode.ownerDocument.createElement(tagName)
		} else {
			if(children.length >= 1) {
				node = parentNode.ownerDocument.createDocumentFragment()
			} else {
				node = parentNode.ownerDocument.createComment("")
			}
		}
		node.domodel = {}
		Object.keys(modelDefinition).filter(property => Core.PROPERTIES.includes(property) === false).forEach(function(property) {
			if(typeof node[property] !== "undefined") {
				node[property] = modelDefinition[property]
			} else {
				node.setAttribute(property, modelDefinition[property])
			}
		})
		for(const child of children) {
			if(Object.prototype.hasOwnProperty.call(child, "model") === true) {
				let childBinding
				if(Object.prototype.hasOwnProperty.call(child, "binding") === true) {
					childBinding = new child.binding({ ...binding.properties, ...child.properties })
					if(Object.prototype.hasOwnProperty.call(child, "identifier") === true) {
						binding.identifier[child.identifier] = childBinding
					}
				}
				binding.run(child.model, { parentNode: node, binding: childBinding })
			} else {
				const childNode = Core.createElement(parentNode, child, binding)
				node.appendChild(childNode)
			}
		}
		if(Object.prototype.hasOwnProperty.call(modelDefinition, "identifier") === true) {
			binding.identifier[modelDefinition.identifier] = node
			node.domodel.identifier = modelDefinition.identifier
		}
		return node
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

export default Core
