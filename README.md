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

A model can also be used to refer to both the [Model](https://domodel.unificator.me/global.html#Model) and its [Binding](https://domodel.unificator.me/domodel/Binding.html) as a whole, that is a component (a search bar model for example). 

Let's take this [Model](https://domodel.unificator.me/global.html#Model) for example:

```javascript
export default {
  tagName: "button"
}
```

That would the equivalent of:

```javascript
const button = document.createElement("button")
```

Next, a [Model](https://domodel.unificator.me/global.html#Model) with children:

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

Notice the ``textContent`` property. You can set any [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) properties in this fashion. 

> If you want to set an ``attribute`` use the attributes object property.

The ``identifier`` allows your binding to track a model and manipulate it in within the available hooks.

#### Properties
<a href="#model-properties"></a>

Most properties listed in your model comes from the [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) class.

It also includes:

- ``tagName`` - ``string`` - Which is passed to ``createElement``
- ``children`` - ``Array`` - To add children to an Element
- ``identifier`` - ``string`` - To save and retrieve a Node
- ``childModel`` - [ChildModel](https://domodel.unificator.me/global.html#ChildModel) - [For model nesting](#nesting-models)


### Core

#### Adding models to the DOM and managing them

To add a [Model](https://domodel.unificator.me/global.html#Model) to the DOM we use the [Core.run](http://domodel.unificator.me/Core.html#.run) method provided by the [Core module](http://domodel.unificator.me/Core.html).

Create a ``main.js`` in ``src/``, it is the entry point module that is defined in your ``index.html`` :

``src/main.js``
```javascript
import { Core } from "domodel" // first we're importing DOModel

// It is preferred to use camel case and suffix model names with "Model" and binding names with "Binding" such as: RectangleModel and RectangleBinding.
import Model from "./model/model.js" // the model we defined earlier, it is our super model
import ModelBinding from ".model/model.binding.js" // the binding we will be defining .bindinglater

window.addEventListener("DOMContentLoaded", function() {
  Core.run(Model, {
    method: Core.METHOD.APPEND_CHILD, // This is the default method and will append the children to the given target.
    binding: new ModelBinding({ myProp: "hello :)" }), // we're creating an instance of our binding (which extends the Binding class provided by DOModel) and passing it to the run method.
    target: document.body // the node we want to target in this case it is the node where we want to append the child node using appendChild.
  })
})

```

Create the associated [Binding](http://domodel.unificator.me/Binding.html):

``src/model/model.binding.js``
```javascript
import { Core } from "domodel" // you could import the library again and run yet another model inside this model

class ModelBinding extends Binding {

  onCreated() {

    // access your model root element through the root property: this.root

    // access identifier with the identifier property:

    this.elements.headline.textContent = "The new world was effectively unveiled before my very eyes"

    // you might even run another model inside this model
  }

}

export default ModelBinding 
```

#### Methods

- ``APPEND_CHILD`` Append your model to ``target``

- ``INSERT_BEFORE`` Insert your model before ``target``

- ``INSERT_AFTER`` Insert your model after ``target``

- ``REPLACE_NODE`` Replace ``target`` with your model

- ``WRAP_NODE`` Wrap ``target`` inside your model

- ``PREPEND`` Insert your model before the first child of ``target``

These are available through [Core.METHOD](https://domodel.unificator.me/global.html#Method).

### Binding

While a [Model](https://domodel.unificator.me/global.html#Model) defines the look of a component, a [Binding](http://domodel.unificator.me/Binding.html) defines its behavior.

#### Hooks

The following are hooks that your binding can implement to add specific behaviors to your models.

#### onCreated

This method will be called before your model is added to the DOM.

#### onConnected

This method will be called immediately after your model is added to the DOM.

#### Properties
<a href="#binding-properties"></a>

The following properties are made available from within the the instance of a [Binding](http://domodel.unificator.me/Binding.html):

- ``root`` Root [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) of your model.
- ``identifier`` Hosts individual [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) previously tagged in the definition of the model (see [Model properties](#model-properties)).

### Methods

#### listen

Listen to a given observable event. See [Binding.listen](https://domodel.unificator.me/Binding.html#listen).

> This is the preferred method for listening to events as any listener will be cleaned up when your binding is removed using [Binding.remove](https://domodel.unificator.me/Binding.html#remove).

#### run

Synonym of [Core.run](https://domodel.unificator.me/Core.html#.run), with the differences being :

- ```target``` property is set to the current binding root element.
- A hierarchy of models is created using Binding._children. Making it easier to remove them using [Binding.remove](https://domodel.unificator.me/Binding.html#remove).

#### remove

Remove the model from the DOM. See [Binding.remove](https://domodel.unificator.me/Binding.html#remove).

### Observable

An [Observable](http://domodel.unificator.me/observable.Observable.html) is a way for your models to communicate with each other and store their states.

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

Here we associate the EventListener with our current binding and give it ``observable`` as the observable to register the events to.

``src/model/model.binding.js``
```javascript
import { Observable, Binding } from "domodel"

import ModelEventListener from "/model/model.event.js"

class ModelBinding extends Binding {

  constructor(observable) {
    super(new ModelEventListener(observable))
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

Core.run(Model, { target: document.body, binding: new ModelBinding({ observable }) })


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
    Core.run(Model, { target: this.root, binding: new ModelBinding() })
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
      arguments: [] // optionnal
      identifier: "model" // optionnal
      // Any other property is not handled.
    }
  ]
}
```

##### Referencing to nested models

In some cases, you might want to reference to a nested model.

You can use the ``identifier``, it will reference to an instance of the [Binding](http://domodel.unificator.me/Binding.html) you specified, in this case it would be an instance of ``ModelBinding``.

Accessing the reference:

``src/model/model.binding.js``

```javascript
import { Binding } from "domodel" // you could import the library again and run yet another model inside this model

class extends Binding {

  onCreated() {

    console.log(this.identifiers.model) // returns an Identifier
    // and much more...

  }

}

export default class 
```

#### Model chain

You can alter an existing model using the `ModelChain` API:

```javascript
const MyModel = {
  tagName: "div",
  children: [
    {
      tagName: "div",
      identifier: "title"
    }
  ]
}

const MyModelChain = new ModelChain(MyModel).after("title", {
  tagName: "div",
  textContent: "A description"
})

Core.run(MyModelChain.definition, { target: document.body })
```

Available methods: 

* `ModelChain.prepend`
* `ModelChain.append`
* `ModelChain.replace`
* `ModelChain.before`
* `ModelChain.after`


### API

See [http://domodel.unificator.me](http://domodel.unificator.me).

## Extensions

See [https://github.com/topics/domodel-extension](https://github.com/topics/domodel-extension).

## Demos

See [https://github.com/topics/domodel-demo](https://github.com/topics/domodel-demo).

## Testing

- ``npm install``
- ``npm test``
