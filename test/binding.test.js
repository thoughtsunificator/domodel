import assert from 'assert'
import { JSDOM } from 'jsdom'

import { Core, Binding, Observable, EventListener } from '../index.js'

const virtualDOM = new JSDOM()
const { document } = virtualDOM.window

let observable

const MyModel = {
	tagName: "div",
	id: "test"
}

const MyBinding3 = class extends Binding {
	onCreated() {
		this.listen(observable, "test", () => {})
		this.listen(observable, "test2", () => {})
	}
}

describe("Binding", function () {

	beforeEach(() => {
		observable = new Observable()
		document.body.innerHTML = ""
	})

	it("instance", () => {
		const binding = new Binding()
		assert.deepEqual(binding._parent, null)
		assert.deepEqual(binding.model, null)
		assert.deepEqual(binding.properties, {})
		assert.deepEqual(binding.identifier, {})
		assert.deepEqual(binding._children, [])
		assert.deepEqual(binding._listeners, [])
		assert.throws(() => {
			binding.properties = {}
		})
		assert.throws(() => {
			binding.identifier = {}
		})
		assert.throws(() => {
			binding.root = {}
		})
		assert.throws(() => {
			binding.model = {}
		})
		assert.throws(() => {
			binding.eventListener = {}
		})
		const binding_ = new Binding({ test: "a" })
		assert.deepEqual(binding_.properties, { test: "a" })
		const eventListener = new EventListener()
		const binding__ = new Binding({ a: "b" }, eventListener)
		assert.deepEqual(binding__.properties, { a: "b" })
		assert.strictEqual(binding__.eventListener, eventListener)
	})

	it("run", () => {
		let childBinding
		const MyBinding = class extends Binding {
			onCreated() {
				childBinding = new MyBinding2()
				this.run(MyModel, { binding: childBinding })
			}
		}
		const MyBinding2 = class extends Binding {
			onCreated() {
				assert.strictEqual(this.properties.property, "a")
				this.root.textContent = "test"
			}
		}
		const binding = new MyBinding({ property: "a" })
		Core.run(MyModel, { binding, parentNode: document.body })
		assert.strictEqual(binding._parent, null)
		assert.strictEqual(binding._root, document.body.querySelector("#test"))
		assert.strictEqual(binding._model, MyModel)
		assert.strictEqual(binding._children.length, 1)
		assert.strictEqual(binding._children[0], childBinding)
		assert.strictEqual(childBinding._parent, binding)
		assert.strictEqual(childBinding._children.length, 0)
	})

	it("listen", () => {
		const binding = new MyBinding3()
		Core.run(MyModel, { binding, parentNode: document.body })
		assert.strictEqual(observable._listeners["test"].length, 1)
		assert.strictEqual(observable._listeners["test2"].length, 1)
		assert.strictEqual(binding._listeners.length, 2)
		assert.strictEqual(Object.keys(observable._listeners).length, 2)
	})

	it("remove", () => {
		const binding = new MyBinding3()
		Core.run(MyModel, { binding, parentNode: document.body })
		assert.strictEqual(document.body.innerHTML, '<div id="test"></div>')
		binding.remove()
		assert.strictEqual(document.body.innerHTML, '')
		assert.strictEqual(observable._listeners["test"].length, 0)
		assert.strictEqual(observable._listeners["test2"].length, 0)
	})
})
