/**
* @global
*
*/

/**
* @example
* const MyModel = {
* 	tagName: "div",
* 	children: [{
*		tagName: "div",
*		identifier: "title"
* 	}]
*}
*
*const MyAlternative = new ModelChain(MyModel).after("title", {
*	tagName: "div",
*	textContent: "A description"
*})
* @class
* @name ModelChain
* @param   {Object} definition
*/
function ModelChain(definition) {
	this.definition = structuredClone(definition)
}

/**
* @method
* @name ModelChain#prepend
* @param {string} [parentIdentifier]
* @param {object} definition
* @returns {ModelChain}
*/
ModelChain.prototype.prepend = function(parentIdentifier, definition) {
	if(parentIdentifier === null) {
		this.definition.children.unshift(definition)
	} else {
		const { object } = getObjectByIdentifier(parentIdentifier, this.definition)
		console.log(object, parentIdentifier)
		if(!object.children) {
			object.children = []
		}
		object.children.unshift(definition)
	}
	return this
}

/**
* @method
* @name ModelChain#append
* @param {string} [parentIdentifier]
* @param {object} definition
* @returns {ModelChain}
*/
ModelChain.prototype.append = function(parentIdentifier, definition) {
	if(parentIdentifier === null) {
		this.definition.children.push(definition)
	} else {
		const { object } = getObjectByIdentifier(parentIdentifier, this.definition)
		if(!object.children) {
			object.children = []
		}
		object.children.push(definition)
	}
	return this
}

/**
* @method
* @name ModelChain#replace
* @param {string} identifier
* @param {object} definition
* @returns {ModelChain}
*/
ModelChain.prototype.replace = function(identifier, definition) {
	const { object } = getObjectByIdentifier(identifier, this.definition)
	for(const property in object) {
		delete object[property]
	}
	Object.assign(object, definition)
	return this
}

/**
* @method
* @name ModelChain#before
* @param {string} identifier
* @param {object} definition
* @returns {ModelChain}
*/
ModelChain.prototype.before = function(identifier, definition) {
	const { parent, object } = getObjectByIdentifier(identifier, this.definition)
	parent.children.splice(parent.children.indexOf(object), 0, definition)
	return this
}

/**
* @method
* @name ModelChain#after
* @param {string} identifier
* @param {object} definition
* @returns {ModelChain}
*/
ModelChain.prototype.after = function(identifier, definition) {
	const { parent, object } = getObjectByIdentifier(identifier, this.definition)
	parent.children.splice(parent.children.indexOf(object) + 1, 0, definition)
	return this
}

/**
* @ignore
* @param {string} identifier
* @param {object} definition
* @returns {{object: object, parent: object}}
*/
export function getObjectByIdentifier(identifier, definition) {
	/**
	*
	* @param {object} object
	* @param {object} parent
	* @returns {{object: object, parent: object}}
	*/
	function walk(object, parent) {
		if(object.identifier === identifier) {
			return { object, parent }
		}
		if(object.children) {
			for(const child of object.children) {
				const obj = walk(child, object)
				if(obj) {
					return obj
				}
			}
		}
	}
	return walk(definition, null)
}

export default ModelChain
