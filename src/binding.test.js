import { JSDOM } from "jsdom"
import test from "ava"
import { mock } from "node:test"

import { Core, Binding, Observable, EventListener } from "../index.js"



const MyModel = {
	tagName: "div",
	id: "test"
}

class MyBinding3 extends Binding {

	onCreated() {
		this.listen(this.properties.observable, "test", () => {})
		this.listen(this.properties.observable, "test2", () => {})
	}
}

class MyBinding4 extends Binding {

	constructor(properties) {
		super(properties)
		this.clickA = 0
		this.clickB = 0
	}

	onCreated() {
		this.addEventListener(this.root.ownerDocument, "click", () => { this.clickA++ })
		this.addEventListener(this.root.ownerDocument.defaultView, "click", () => { this.clickB++ })
		this.listen(this.properties.observable, "test", () => {})
		this.listen(this.properties.observable, "test2", () => {})
	}
}

test.beforeEach((t) => {
	const virtualDOM = new JSDOM()
	const { document } = virtualDOM.window
	t.context.observable = new Observable()
	t.context.document = document
})

test("Binding instance", (t) => {
	const binding = new Binding()
	t.deepEqual(binding._parent, null)
	t.deepEqual(binding.model, null)
	t.deepEqual(binding.properties, {})
	t.deepEqual(binding.identifier, {})
	t.deepEqual(binding._children, [])
	t.deepEqual(binding._listeners, [])
	t.deepEqual(binding._remoteEventListeners, [])
	t.throws(() => {
		binding.properties = {}
	})
	t.throws(() => {
		binding.identifier = {}
	})
	t.throws(() => {
		binding.root = {}
	})
	t.throws(() => {
		binding.model = {}
	})
	t.throws(() => {
		binding.eventListener = {}
	})
	const binding_ = new Binding({ test: "a" })
	t.deepEqual(binding_.properties, { test: "a" })
	const eventListener = new EventListener()
	const binding__ = new Binding({ a: "b" }, eventListener)
	t.deepEqual(binding__.properties, { a: "b" })
	t.is(binding__.eventListener, eventListener)
})


test("Binding addEventListener", (t) => {
	const binding = new MyBinding3({ property: "a" })
	const f = () => {}
	const f2 = () => {}
	mock.method(t.context.document.body, "addEventListener", () => {})
	mock.method(t.context.document.defaultView, "addEventListener", () => {})
	binding.addEventListener(t.context.document.body, "click", f, { foo: "bar" })
	binding.addEventListener(t.context.document.defaultView, "keydown", f2)
	t.is(binding._remoteEventListeners[0].target, t.context.document.body)
	t.is(binding._remoteEventListeners[0].type, "click")
	t.is(binding._remoteEventListeners[0].listener, f)
	t.is(binding._remoteEventListeners[1].target, t.context.document.defaultView)
	t.is(binding._remoteEventListeners[1].type, "keydown")
	t.is(binding._remoteEventListeners[1].listener, f2)
	t.is(t.context.document.body.addEventListener.mock.callCount(), 1)
	t.deepEqual(t.context.document.body.addEventListener.mock.calls[0].arguments, ["click", f, { foo: "bar" }])
	t.is(t.context.document.defaultView.addEventListener.mock.callCount(), 1)
	t.deepEqual(t.context.document.defaultView.addEventListener.mock.calls[0].arguments, ["keydown", f2, undefined])
})

test("Binding run", (t) => {
	let childBinding
	const MyBinding = class extends Binding {
		onCreated() {
			childBinding = new MyBinding2()
			this.run(MyModel, { binding: childBinding })
		}
	}
	const MyBinding2 = class extends Binding {
		onCreated() {
			t.is(this.properties.property, "a")
			this.root.textContent = "test"
		}
	}
	const binding = new MyBinding({ property: "a" })
	Core.run(MyModel, { binding, parentNode: t.context.document.body })
	t.is(binding._parent, null)
	t.is(binding._root, t.context.document.body.querySelector("#test"))
	t.is(binding._model, MyModel)
	t.is(binding._children.length, 1)
	t.is(binding._children[0], childBinding)
	t.is(binding.document, t.context.document)
	t.is(binding.window, t.context.document.defaultView)
	t.is(childBinding._parent, binding)
	t.is(childBinding._children.length, 0)
})

test("Binding run identifier", (t) => {
	const MyBinding = class extends Binding {
		onCreated() {
			this.run(MyModel, { identifier: "test", binding: new MyBinding2() })
		}
	}
	const MyBinding2 = class extends Binding {}
	const binding = new MyBinding({ property: "a" })
	Core.run(MyModel, { binding, parentNode: t.context.document.body })
	t.is(binding.identifier["test"], binding.root.childNodes[0])
	t.is(binding.getIdentifier("test"), binding.identifier["test"])
})

test("Binding listen", (t) => {
	const binding = new MyBinding3({ observable: t.context.observable })
	Core.run(MyModel, { binding, parentNode: t.context.document.body })
	function myCallback() {}
	t.is(t.context.observable._listeners["test"].length, 1)
	binding.listen(t.context.observable, "test", myCallback, true)
	t.is(t.context.observable._listeners["test"].length, 2)
	t.is(t.context.observable._listeners["test2"].length, 1)
	t.is(t.context.observable._listeners["test"][0].callback, myCallback)
	t.is(binding._listeners.length, 3)
	t.is(Object.keys(t.context.observable._listeners).length, 2)
})

test("Binding remove", (t) => {
	const binding = new MyBinding3({ observable: t.context.observable })
	Core.run(MyModel, { binding, parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="test"></div>')
	binding.remove()
	t.is(t.context.document.body.innerHTML, "")
	t.is(t.context.observable._listeners["test"].length, 0)
	t.is(t.context.observable._listeners["test2"].length, 0)
})

test("Binding remove documentFragment", (t) => {
	const MyModel5 = {
		children: [
			{
				tagName: "div",
				id: "test"
			}
		]
	}
	const binding = new MyBinding3({ observable: t.context.observable })
	Core.run(MyModel5, { binding, parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="test"></div>')
	binding.remove()
	t.is(t.context.document.body.innerHTML, "")
})

test("Binding remove placeholder documentFragment", (t) => {
	const MyModel5 = {
		tagName: "div",
		id: "test",
		children: [
			{
				identifier: "test"
			}
		]
	}
	const binding = new MyBinding3({ observable: t.context.observable })
	Core.run(MyModel5, { binding, parentNode: t.context.document.body })
	binding.run({ tagName: "button" }, { binding: new MyBinding3({ observable: t.context.observable }), parentNode: binding.identifier.test })
	t.is(t.context.document.body.innerHTML, '<div id="test"><button></button></div>')
	console.log(binding.identifier.test)
	const b2 = new MyBinding3({ observable: t.context.observable })
	binding.run({ tagName: "button" }, { identifier: "test3", binding: b2, parentNode: binding.identifier.test })
	t.is(t.context.document.body.innerHTML, '<div id="test"><button></button><button></button></div>')
	t.is(binding.identifier.test3.tagName, "BUTTON")
	binding.remove()
	t.is(t.context.document.body.innerHTML, "")
})

test("Binding remove eventListeners", (t) => {
	const binding = new MyBinding4({ observable: t.context.observable })
	Core.run(MyModel, { binding, parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="test"></div>')
	t.is(binding.clickA, 0)
	t.is(binding.clickB, 0)
	binding.root.ownerDocument.dispatchEvent(new binding.root.ownerDocument.defaultView.Event("click"))
	t.is(binding.clickA, 1)
	t.is(binding.clickB, 0)
	binding.root.ownerDocument.defaultView.dispatchEvent(new binding.root.ownerDocument.defaultView.Event("click"))
	t.is(binding.clickA, 1)
	t.is(binding.clickB, 1)
	binding.remove()
	binding.root.ownerDocument.defaultView.dispatchEvent(new binding.root.ownerDocument.defaultView.Event("click"))
	binding.root.ownerDocument.defaultView.dispatchEvent(new binding.root.ownerDocument.defaultView.Event("click"))
	t.is(binding.clickA, 1)
	t.is(binding.clickB, 1)
	t.is(t.context.document.body.innerHTML, "")
	t.is(t.context.observable._listeners["test"].length, 0)
	t.is(t.context.observable._listeners["test2"].length, 0)
})

test("Binding onRendered", (t) => {
	const MyModel2 = {
		tagName: "button"
	}
	const MyBinding = class extends Binding {
		onCreated() {
			this.run(MyModel2, { binding: new MyBinding2() })
		}
	}
	const MyBinding2 = class extends Binding {
		onRendered() {
			t.true(this.root.isConnected)
			this.root.textContent = "rendered"
		}
	}
	const binding = new MyBinding()
	Core.run(MyModel, { binding, parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, "<div id=\"test\"><button>rendered</button></div>")
})

test("Binding onRendered multiples", (t) => {
	t.plan(3)
	const MyModel2 = {
		tagName: "button"
	}
	const TestBinding = class extends Binding {
		onCreated() {
			this.run(MyModel2, { binding: new TestBinding2() })
			this.run(MyModel2, { binding: new TestBinding3() })
		}
	}
	const TestBinding2 = class extends Binding {
		onRendered() {
			t.true(this.root.isConnected)
			this.root.textContent = "rendered"
		}
	}
	const TestBinding3 = class extends Binding {
		onRendered() {
			t.true(this.root.isConnected)
			this.root.textContent = "rendered"
		}
	}
	const binding = new TestBinding()
	Core.run(MyModel, { binding, parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, "<div id=\"test\"><button>rendered</button><button>rendered</button></div>")
})
