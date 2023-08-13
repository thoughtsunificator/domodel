# domodel

domodel is front-end library that organizes the user interface into models (look) and bindings (behavior) it follows the principle of separation of concerns, it also introduce elements of the observable pattern for the communication between the different parts of the user interface.

## Getting started

### Installing

#### Setup a new project

``npx create-domodel-app [name]``

#### Setup as a dependency to an existing project

``npm install domodel``

### Model

A model is a JSON representation of a DOM [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element).

Let's take this model for example:

```javascript
export default {
  tagName: "button"
}
```

That would the equivalent of:

```javascript
const button = document.createElement("button")
```

A model with children:

```javascript
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
```

You can ommit the ``tagName`` and you will get a fragment document model:


```javascript
export default {
  children: [
    {
      tagName: "h2",
      identifier: "headline",
      textContent: "Unveil a new world"
    }
  ]
}
```

Notice the ``textContent`` property. You can set any [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) properties in this fashion.

The ``identifier`` property is a model property.

* The term model will later be used to refer to both the model and its [Binding](https://thoughtsunificator.github.io/domodel/Binding.html) to make it simpler.

#### Properties
<a href="#model-properties"></a>

Most properties listed in your model are defined at the Element level.

However custom properties are not set on the Element as they have unusual behaviors they are treated differently:

- ``tagName`` - String - Passed to ``createElement``
- ``children`` - Array - To add children to an Element
- ``identifier`` - String - To save and retrieve a Node
- ``model`` - Model - Specify the model that should be ran
- ``binding`` - [Binding](https://thoughtsunificator.github.io/domodel/Binding.html) - Specify the [Binding](https://thoughtsunificator.github.io/domodel/Binding.html) to use when running the model (``model`` property must be set)
- ``properties`` - Object - Specify the arguments to pass along the [Binding](https://thoughtsunificator.github.io/domodel/Binding.html) (``binding`` property must be set)

### Binding

Now that we're able to create models, we will learn how to turn them into a real [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) ?

#### Properties
<a href="#binding-properties"></a>

These properties are available from within the the instance of a [Binding](https://thoughtsunificator.github.io/domodel/Binding.html):

- ``properties`` Properties passed along when instancing a binding.
- ``root`` Root [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) of your model.
- ``identifier`` Hosts individual [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) previously tagged in the definition of the model (see [Model properties](#model-properties)).

#### Adding models to the DOM and managing them

We might know how to define models however they wont simply be added by defining them alone.

For that we have to use the [Core.run](https://thoughtsunificator.github.io/domodel/Core.html#.run) method provided by DOModel object and tell it how to add them.

The first step in your project would be create or edit the ``main.js`` in ``src/``, it is the entry point module that is defined in your ``index.html``.

``src/main.js``
```javascript
import { Core } from "domodel" // first we're importing DOModel

// It is preferred to use camel case and suffix model names with "Model" and binding names with "Binding" such as: RectangleModel and RectangleBinding.
import Model from "./model/model.js" // the model we defined earlier, it is our super model
import ModelBinding from ".model/model.binding.js" // the binding we will be defining .bindinglater

window.addEventListener("load", function() { // we only add the
  Core.run(Model, {
    method: Core.METHOD.APPEND_CHILD, // This is the default method and will append the children to the given parentNode.
    binding: new ModelBinding({ myProp: "hello :)" }), // we're creating an instance of our binding (which extends the Binding class provided by DOModel) and passing it to the run method.
    parentNode: document.body // the node we want to target in this case it is the node where we want to append the child node using appendChild.
  })
})

```

Now that your ``main.js`` is created let's create your first [Binding](https://thoughtsunificator.github.io/domodel/Binding.html):

``src/model/model.binding.js``
```javascript
import { Core } from "domodel" // you could import the library again and run yet another model inside this model

class ModelBinding extends Binding {

  onCreated() {
    const { myProp } = this.properties

    console.log(myProp) // prints hello

    // access your model root element through the root property: this.root

    // access identifier with the identifier property:

    this.identifier.headline.textContent = "The new world was effectively unveiled before my very eyes"

    // you might even run another model inside this model
  }

}

export default ModelBinding 
```

### Methods

- ``APPEND_CHILD`` Append your model to ``parentNode``

- ``INSERT_BEFORE`` Insert your model before ``parentNode``

- ``REPLACE_NODE`` Replace ``parentNode`` with your model

- ``WRAP_NODE`` Wrap ``parentNode`` inside your model

- ``PREPEND`` Insert your model before the first child of ``parentNode``

They are available through ``Core.METHOD``.

### Observable

An [Observable](https://thoughtsunificator.github.io/domodel/observable.Observable.html) is a way for your models to communicate with each other.

``src/object/observable-example.js``
```javascript
import { Observable } from "domodel"

class ExampleObservable extends Observable {

  // you can have a constructor

  // getter setter...

  // or even better, you could have methods.

}

export default ExampleObservable 
```

#### Listening to events

##### EventListener

Here we associate the EventListener with our current binding and give it ``properties.observable`` as the observable to register the events to.

``src/model/model.binding.js``
```javascript
import { Observable, Binding } from "domodel"

import ModelEventListener from "/model/model.event.js"

class ModelBinding extends Binding {

  constructor(properties) {
    super(properties, new ModelEventListener(properties.observable))
  }

}

export default ModelBinding 
```

Any method inside an ``EventListener`` is automatically registered as a listener to the given observable.

``src/model/model.event.js``
```javascript
import { EventListener } from "domodel"

class ModelEventListener extends EventListener {

  message(data) {
    console.log(data)
  } 

}

export default ModelEventListener 
```

##### observable.listen

Useful when you want to listen to other parts your UI.

``src/model/model.binding.js``
```javascript
import { Observable, Binding } from "domodel"

class ModelBinding extends Binding {

  onCreated() {

    const observable = new Observable()

    observable.listen("message", data => {
      console.log(data)
    })

  }

}

export default ModelBinding 
```

#### Emitting events

``src/model/model.binding.js``
```javascript
import { Observable } from "domodel"

class ModelBinding extends Binding {

  onCreated() {

    const observable = new Observable()

    observable.emit("message", { /* data go here */ })

  }

}

export default ModelBinding 
```

Running your model:

```javascript
import { Core, Observable } from "domodel"

import Model from "/model/model.js"
import ModelBinding from "/model/model.binding.js"

const observable = new Observable()

Core.run(Model, { parentNode: document.body, binding: new ModelBinding({ observable }) })


```

### Advanced

#### Nesting models

##### Method 1 - Import

``src/model/application.js``
```javascript
import Model from "./model.js"

export default {
  tagName: "div",
  children: [
    Model
  ]
}
```

##### Method 2 - Binding

``src/model/application.binding.js``
```javascript
import { Core } from "domodel"

import Model from "./model.js"
import ModelBinding from "./model.binding.js"

class extends Binding {

  onCreated() {
    Core.run(Model, { parentNode: this.root, binding: new ModelBinding() })
  }

}

export default class 
```

##### Method 3 - "model" property

``src/model/application.js``
```javascript
import Model from "./model.js"
import ModelBinding from "./model.binding.js"

export default {
  tagName: "div",
  children: [
    {
      model: Model,
      binding: ModelBinding // optionnal
      properties: {} // optionnal
      identifier: "model" // optionnal
      // Any other property is not handled.
    }
  ]
}
```

##### Referencing to nested models

In some cases, you might want to reference to a nested model.

You can use the ``identifier``, it will reference to an instance of the [Binding](https://thoughtsunificator.github.io/domodel/Binding.html) you specified, in this case it would be an instance of ``ModelBinding``.

Accessing the reference:

``src/model/model.binding.js``

```javascript
import { Binding } from "domodel" // you could import the library again and run yet another model inside this model

class extends Binding {

  onCreated() {

    console.log(this.identifier.model) // returns an instance of ModelBinding
    // You could access the root element of the nested model through:
    console.log(this.identifier.model.root)
    // and much more...

  }

}

export default class 
```

### API

See [https://thoughtsunificator.github.io/domodel](https://thoughtsunificator.github.io/domodel).

## Extensions

See [https://github.com/topics/domodel-extension](https://github.com/topics/domodel-extension).

## Demos

See [https://github.com/topics/domodel-demo](https://github.com/topics/domodel-demo).

## Testing

- ``npm install``
- ``npm test``
