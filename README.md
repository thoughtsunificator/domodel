# domodel [![Build Status](https://travis-ci.com/thoughtsunificator/domodel.svg?branch=master)](https://travis-ci.com/thoughtsunificator/domodel)

domodel is library that organizes the user interface into models (look) and bindings (behavior) it follows the principle of separation of concerns, domodel also introduce elements of the observable pattern for the communication between the different parts of the user interface.

## Summary

- [Getting started](#getting-started)
	- [Installing](#installing)
	- [Model](#model)
		- [Properties](#model-properties)
	- [Binding](#binding)
		- [Properties](#binding-properties)
		- [Adding models to the DOM and managing them](#adding-models-to-the-dom-and-managing-them)
	- [Methods](#methods)
	- [Observable](#observable)
		- [Listening](#listening)
		- [Emitting](#emitting)
- [Advanced](#advanced)
	- [Nesting models](#nesting-models)
		- [Method 1](#method-1)
		- [Method 2](#method-2)
		- [Method 3](#method-3)
		- [Method 4](#method-4)
		- [Referencing to nested models](#referencing-to-nested-models)
- [API](#api)
- [Extensions](#extensions)
- [Demos](#demos)
- [Testing](#running-the-tests)

## Getting started

### Installing

#### Setup a new project

``npx create-domodel-app [name]``

#### Setup as a dependency to an existing project

``npm install domodel``

### Model

A model is a JSON representation of a DOM [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element).

Let's take this model for example:

````javascript
export default {
	tagName: "button"
}
````

That would the equivalent of:

````javascript
const button = document.createElement("button")
````

A model with children:

````javascript
export default {
	tagName: "div",
	children: [
		{
			tagName: "h2",
			identifier: "headline",
			textContent: "Unveil a new world"
		}
	]
}
````

Notice the ``textContent`` property. You can set any [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) properties in this fashion.

The ``identifier`` property is a model property.

* The term model will later be used to refer to both the model and its [Binding](https://thoughtsunificator.github.io/domodel/module-binding-Binding.html) to make it simpler.

#### Properties
<a href="#model-properties"></a>

Most properties listed in your model are defined at the Element level.

However custom properties are not set on the Element as they have unusual behaviors they are treated differently:

- ``tagName`` - String - Passed to ``createElement``
- ``children`` - Array - To add children to an Element
- ``identifier`` - String - To save and retrieve a Node
- ``model`` - Model - Specify the model that should be ran
- ``binding`` - [Binding](https://thoughtsunificator.github.io/domodel/module-binding-Binding.html) - Specify the [Binding](https://thoughtsunificator.github.io/domodel/module-binding-Binding.html) to use when running the model (``model`` property must be set)
- ``properties`` - Object - Specify the arguments to pass along the [Binding](https://thoughtsunificator.github.io/domodel/module-binding-Binding.html) (``binding`` property must be set)

### Binding

Now that we're able to create models, we will learn how to turn them into a real [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) ?

#### Properties
<a href="#binding-properties"></a>

These properties are available from within the the instance of a [Binding](https://thoughtsunificator.github.io/domodel/module-binding-Binding.html):

- ``properties`` Properties passed along when instancing a binding.
- ``root`` Root [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) of your model.
- ``identifier`` Hosts individual [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) previously tagged in the definition of the model (see [Model properties](#model-properties)).

#### Adding models to the DOM and managing them

We might know how to define models however they wont simply be added by defining them alone.

For that we have to use the [Core.run](https://thoughtsunificator.github.io/domodel/module-core.html#~run) method provided by DOModel object and tell it how to add them.

The first step in your project would be create or edit the ``main.js`` in ``src/``, it is the entry point module that is defined in your ``index.html``.

``src/main.js``
````javascript
import { Core } from "domodel" // first we're importing DOModel

// It is preferred to use camel case and suffix model names with "Model" and binding names with "Binding" such as: RectangleModel and RectangleBinding.
import MyModel from "./model/model.js" // the model we defined earlier, it is our super model
import MyBinding from ".model/model.binding.js" // the binding we will be defining .bindinglater

window.addEventListener("load", function() { // we only add the
	Core.run(MyModel, {
		method: Core.METHOD.APPEND_CHILD, // This is the default method and will append the children to the given parentNode.
		binding: new MyBinding({ myProp: "hello :)" }), // we're creating an instance of our binding (which extends the Binding class provided by DOModel) and passing it to the run method.
		parentNode: document.body // the node we want to target in this case it is the node where we want to append the child node using appendChild.
	})
})

````

Now that your ``main.js`` is created let's create your first [Binding](https://thoughtsunificator.github.io/domodel/module-binding-Binding.html):

``src/model/model.binding.js``
````javascript
import { Core } from "domodel" // you could import the library again and run yet another model inside this model

export default class extends Binding {

	onCreated() {
		const { myProp } = this.properties

		console.log(myProp) // prints hello

		// access your model root element through the root property: this.root

		// access identifier with the identifier property:

		this.identifier.headline.textContent = "The new world was effectively unveiled before my very eyes"

		// you might even run another model inside this model
	}

}
````

### Methods

- ```APPEND_CHILD``` Append your model to ``parentNode``

- ```INSERT_BEFORE``` Insert your model before ``parentNode``

- ```REPLACE_NODE``` Replace ``parentNode`` with your model

- ```WRAP_NODE``` Wrap ``parentNode`` inside your model

- ```PREPEND``` Insert your model before the first child of ``parentNode``

They are available through ``Core.METHOD``.

### Observable

An [Observable](https://thoughtsunificator.github.io/domodel/module-observable.Observable.html) is a way for your models to communicate with each other.

``src/object/observable-example.js``
```javascript
import { Observable } from "domodel"

export default class extends Observable {

	// you can have a constructor

	// getter setter...

	// or even better, you could have methods.

}
```

#### Listening to events

``src/model/model.binding.js``
```javascript
import Game from "/object/game.js"

export default class {

	onCreated() {

		const game = new Game()

		this.listen(game, "message", async data => {
			console.log(data)
		})

	}

}
```

#### Emitting events

``src/model/model.binding.js``
```javascript
import Game from "/object/game.js"

export default class {

	onCreated() {

		const game = new Game()

		game.emit("message", { /* data go here */ })

	}

}
```

### Advanced

#### Nesting models

##### Method 1 - Import

``src/model/main-model.js``
````javascript
import MyModel from "./my-model.js"

export default {
	tagName: "div",
	children: [
		MyModel
	]
}
````

##### Method 2 - Callback

``src/model/main-model.js``
````javascript
export default data => ({
	tagName: "div",
	children: [
		data
	]
})
````

##### Method 3 - Binding

``src/model/main-model.binding.js``
````javascript
import { Core } from "domodel"

import MyModel from "./my-model.js"
import MyBinding from "./my-model.binding.js"

export default class extends Binding {

	onCreated() {
		Core.run(MyModel, { parentNode: this.root, binding: new MyBinding() })
	}

}
````

##### Method 4 - "model" property

``src/model/main-model.js``
````javascript
import MyModel from "./my-model.js"
import MyBinding from "./my-model.binding.js"

export default {
	tagName: "div",
	children: [
		{
			model: MyModel,
			binding: MyBinding // optionnal
			properties: {} // optionnal
			identifier: "model" // optionnal
			// Any other property is not handled.
		}
	]
}
````
What happens is that DOModel will be itself calling the ``run`` method with the argument you provided.

The hierarchy of nodes stops here and continue in the model you specified.

##### Referencing to nested models

In some cases, you might want to reference to a nested model.

You can use the ``identifier``, it will reference to an instance of the [Binding](https://thoughtsunificator.github.io/domodel/module-binding-Binding.html) you specified, in this case it would be an instance of ``MyBinding``.

Accessing the reference:

``src/model/my-model.binding.js``

````javascript
import { Binding } from "domodel" // you could import the library again and run yet another model inside this model

export default class extends Binding {

	onCreated() {

		console.log(this.identifier.model) // returns an instance of MyBinding
		// You could access the root element of the nested model through:
		console.log(this.identifier.model.root)
		// and much more...

	}

}
````

### API

See [https://thoughtsunificator.github.io/domodel](https://thoughtsunificator.github.io/domodel).

## Extensions

See [https://github.com/topics/domodel-extension](https://github.com/topics/domodel-extension).

## Demos

See [https://github.com/topics/domodel-demo](https://github.com/topics/domodel-demo).

## Testing

- ``npm install``
- ``npm test``
