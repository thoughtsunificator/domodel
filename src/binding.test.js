import { JSDOM } from "jsdom"
import test from "ava"

import { Core, Binding, Observable, EventListener } from "../index.js"



const MyModel = {
	tagName: "div",
	id: "test"
}

const MyBinding3 = class extends Binding {
	onCreated() {
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
