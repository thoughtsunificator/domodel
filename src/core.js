import Binding from "./binding.js"

/**
 * @global
 */
class Core {

	/**
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
		* @property Method.REPLACE_NODE  {string}
		* @property Method.WRAP_NODE     {string}
		* @property Method.PREPEND       {string}
		* @example Core.Method.APPEND_CHILD
		*/
	static METHOD = {
		APPEND_CHILD: "APPEND_CHILD",
		INSERT_BEFORE: "INSERT_BEFORE",
		REPLACE_NODE: "REPLACE_NODE",
		WRAP_NODE: "WRAP_NODE",
		PREPEND: "PREPEND",
	}

	/**
		* @param {Object}        model
		* @param {Object}        properties
		* @param {Element}       properties.parentNode
		* @param {Binding}       [properties.binding=new Binding()]
		* @param {Method}        [properties.method=Core.METHOD.APPEND_CHILD]
		* @example Core.run(Model, { parentNode: document.body, binding: new Binding() })
		*/
	static run(model, { parentNode, binding = new Binding(), method = Core.METHOD.APPEND_CHILD } = {}) {
		const node = Core.createNode(parentNode, model, binding)
		binding._root = node
		binding._model = model
		for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(binding.eventListener)).filter(name => name !== "constructor" && typeof binding.eventListener[name] === "function")) {
			binding.listen(binding.eventListener.observable, name, binding.eventListener[name].bind(binding))
		}
		binding.onCreated()
		if (method === Core.METHOD.APPEND_CHILD) {
			parentNode.appendChild(node)
		} else if (method === Core.METHOD.INSERT_BEFORE) {
			parentNode.parentNode.insertBefore(node, parentNode)
		} else if (method === Core.METHOD.REPLACE_NODE) {
			parentNode.replaceWith(node)
		} else if (method === Core.METHOD.WRAP_NODE) {
			node.appendChild(parentNode.cloneNode(true))
			parentNode.replaceWith(node)
		} else if (method === Core.METHOD.PREPEND) {
			parentNode.prepend(node)
		}
		binding.onRendered()
	}

	/**
		* @ignore
		* @param   {Object} Node
		* @param   {Object} model
		* @param   {Object} Binding
		* @returns {Node}
		*/
	static createNode(parentNode, model, binding) {
		const { tagName, children = [] } = model
		const node = parentNode.ownerDocument.createElement(tagName)
		Object.keys(model).filter(property => Core.PROPERTIES.includes(property) === false).forEach(function(property) {
			node[property] = model[property]
		})
		for (const child of children) {
			if(Object.prototype.hasOwnProperty.call(child, "model") === true) {
				let childBinding
				if(Object.prototype.hasOwnProperty.call(child, "binding") === true) {
					childBinding = new child.binding({...binding.properties, ...child.properties})
					if(Object.prototype.hasOwnProperty.call(child, "identifier") === true) {
						binding.identifier[child.identifier] = childBinding
					}
				}
				binding.run(child.model, { parentNode: node, binding: childBinding })
			} else {
				const childNode = Core.createNode(parentNode, child, binding)
				node.appendChild(childNode)
			}
		}
		if(Object.prototype.hasOwnProperty.call(model, "identifier") === true) {
			binding.identifier[model.identifier] = node
		}
		return node
	}

}

export default Core
