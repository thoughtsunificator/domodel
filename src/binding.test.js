import { JSDOM } from "jsdom"
import ava from "ava"
import { mock } from "node:test"

import { Core, Binding, Observable, EventListener } from "../index.js"

const MyModel = {
	tagName: "div",
	id: "test"
}

class MyBinding3 extends Binding {

	constructor(observable) {
		super()
		this.observable = observable
	}

	onCreated() {
		this.listen(this.observable, "test", () => {})
		this.listen(this.observable, "test2", () => {})
	}
}

class MyBinding4 extends Binding {

	constructor(observable) {
		super()
		this.observable = observable
		this.clickA = 0
		this.clickB = 0
	}

	onCreated() {
		this.addEventListener(this.root.ownerDocument, "click", () => { this.clickA++ })
		this.addEventListener(this.root.ownerDocument.defaultView, "click", () => { this.clickB++ })
		this.listen(this.observable, "test", () => {})
		this.listen(this.observable, "test2", () => {})
	}
}

ava.beforeEach((test) => {
	const virtualDOM = new JSDOM()
	const { document } = virtualDOM.window
	test.context.observable = new Observable()
	test.context.document = document
})

ava("instance", (test) => {
	const binding = new Binding()
	test.deepEqual(binding.parent, null)
	test.deepEqual(binding.model, null)
	test.deepEqual(binding.identifier, {})
	test.deepEqual(binding.elements, {})
	test.deepEqual(binding.children, [])
	test.deepEqual(binding.listeners, [])
	test.deepEqual(binding.remoteEventListeners, [])
	const eventListener = new EventListener()
	const binding2 = new Binding(eventListener)
	test.is(binding2.eventListener, eventListener)
})

ava("addEventListener", (test) => {
	const binding = new MyBinding3("a")
	const f = () => {}
	const f2 = () => {}
	mock.method(test.context.document.body, "addEventListener", () => {})
	mock.method(test.context.document.defaultView, "addEventListener", () => {})
	binding.addEventListener(test.context.document.body, "click", f, { foo: "bar" })
	binding.addEventListener(test.context.document.defaultView, "keydown", f2)
	test.is(binding.remoteEventListeners[0].target, test.context.document.body)
	test.is(binding.remoteEventListeners[0].type, "click")
	test.is(binding.remoteEventListeners[0].listener, f)
	test.is(binding.remoteEventListeners[1].target, test.context.document.defaultView)
	test.is(binding.remoteEventListeners[1].type, "keydown")
	test.is(binding.remoteEventListeners[1].listener, f2)
	test.is(test.context.document.body.addEventListener.mock.callCount(), 1)
	test.deepEqual(test.context.document.body.addEventListener.mock.calls[0].arguments, ["click", f, { foo: "bar" }])
	test.is(test.context.document.defaultView.addEventListener.mock.callCount(), 1)
	test.deepEqual(test.context.document.defaultView.addEventListener.mock.calls[0].arguments, ["keydown", f2, undefined])
})

ava("run", (test) => {
	let childBinding
	const MyBinding = class extends Binding {
		constructor(property) {
			super()
			this.property = property
		}

		onCreated() {
			childBinding = new MyBinding2("a")
			this.run(MyModel, { binding: childBinding })
		}
	}
	const MyBinding2 = class extends Binding {
		constructor(property) {
			super()
			this.property = property
		}

		onCreated() {
			test.is(this.property, "a")
			this.root.textContent = "test"
		}
	}
	const binding = new MyBinding("a")
	Core.run(MyModel, { binding, target: test.context.document.body })
	test.is(binding.parent, null)
	test.is(binding.root, test.context.document.body.querySelector("#test"))
	test.is(binding.model, MyModel)
	test.is(binding.children.length, 1)
	test.is(binding.children[0].binding, childBinding)
	test.is(binding.document, test.context.document)
	test.is(binding.window, test.context.document.defaultView)
	test.is(childBinding.parent, binding)
	test.is(childBinding.children.length, 0)
})

ava("run identifier", (test) => {
	const MyBinding2 = class extends Binding {}
	const MyBinding = class extends Binding {
		onCreated() {
			this.run(MyModel, { binding: new MyBinding2(), identifier: "test" })
		}
	}
	const binding = new MyBinding()
	Core.run(MyModel, { binding, target: test.context.document.body })
	test.true(binding.identifier["test"].binding instanceof MyBinding2)
	test.is(binding.identifier["test"].element, binding.root.childNodes[0])
})

ava("listen", (test) => {
	const binding = new MyBinding3(test.context.observable)
	Core.run(MyModel, { binding, target: test.context.document.body })
	function myCallback() {}
	test.is(test.context.observable._listeners["test"].length, 1)
	binding.listen(test.context.observable, "test", myCallback, true)
	test.is(test.context.observable._listeners["test"].length, 2)
	test.is(test.context.observable._listeners["test2"].length, 1)
	test.is(test.context.observable._listeners["test"][0].callback, myCallback)
	test.is(binding.listeners.length, 3)
	test.is(Object.keys(test.context.observable._listeners).length, 2)
})

ava("remove", (test) => {
	const binding = new MyBinding3(test.context.observable)
	Core.run(MyModel, { binding, target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="test"></div>')
	binding.remove()
	test.is(test.context.document.body.innerHTML, "")
	test.is(test.context.observable._listeners["test"].length, 0)
	test.is(test.context.observable._listeners["test2"].length, 0)
})

ava("remove eventListeners", (test) => {
	const binding = new MyBinding4(test.context.observable)
	Core.run(MyModel, { binding, target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="test"></div>')
	test.is(binding.clickA, 0)
	test.is(binding.clickB, 0)
	binding.root.ownerDocument.dispatchEvent(new binding.root.ownerDocument.defaultView.Event("click"))
	test.is(binding.clickA, 1)
	test.is(binding.clickB, 0)
	binding.root.ownerDocument.defaultView.dispatchEvent(new binding.root.ownerDocument.defaultView.Event("click"))
	test.is(binding.clickA, 1)
	test.is(binding.clickB, 1)
	binding.remove()
	binding.root.ownerDocument.defaultView.dispatchEvent(new binding.root.ownerDocument.defaultView.Event("click"))
	binding.root.ownerDocument.defaultView.dispatchEvent(new binding.root.ownerDocument.defaultView.Event("click"))
	test.is(binding.clickA, 1)
	test.is(binding.clickB, 1)
	test.is(test.context.document.body.innerHTML, "")
	test.is(test.context.observable._listeners["test"].length, 0)
	test.is(test.context.observable._listeners["test2"].length, 0)
})

ava("onConnected", (test) => {
	const MyModel2 = {
		tagName: "button"
	}
	const MyBinding = class extends Binding {
		onCreated() {
			this.run(MyModel2, { binding: new MyBinding2() })
		}
	}
	const MyBinding2 = class extends Binding {
		onConnected() {
			test.true(this.root.isConnected)
			this.root.textContent = "connected"
		}
	}
	const binding = new MyBinding()
	Core.run(MyModel, { binding, target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, "<div id=\"test\"><button>connected</button></div>")
})

ava("onConnected multiples", (test) => {
	test.plan(3)
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
		onConnected() {
			test.true(this.root.isConnected)
			this.root.textContent = "connected"
		}
	}
	const TestBinding3 = class extends Binding {
		onConnected() {
			test.true(this.root.isConnected)
			this.root.textContent = "connected"
		}
	}
	const binding = new TestBinding()
	Core.run(MyModel, { binding, target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, "<div id=\"test\"><button>connected</button><button>connected</button></div>")
})
