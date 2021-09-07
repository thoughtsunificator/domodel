import { JSDOM } from 'jsdom'

import { Core, Binding, Observable } from '../index.js'

const virtualDOM = new JSDOM()
const { document } = virtualDOM.window

let observable

export function setUp(callback) {
	observable = new Observable()
	document.body.innerHTML = ""
	callback()
}

const MyModel = {
	tagName: "div"
}

const MyBinding3 = class extends Binding {
	onCreated() {
		this.listen(observable, "test", () => {})
		this.listen(observable, "test2", () => {})
	}
}

export function run(test) {
	test.expect(6)
	let childBinding
	const MyBinding = class extends Binding {
		onCreated() {
			childBinding = new MyBinding2()
			this.run(MyModel, { binding: childBinding })
		}
	}
	const MyBinding2 = class extends Binding {
		onCreated() {
			test.strictEqual(this.properties.property, "a")
			this.root.textContent = "test"
		}
	}
	const binding = new MyBinding({ property: "a" })
	Core.run(MyModel, { binding, parentNode: document.body })
	test.strictEqual(binding._parent, null)
	test.strictEqual(binding._children.length, 1)
	test.strictEqual(binding._children[0], childBinding)
	test.strictEqual(childBinding._parent, binding)
	test.strictEqual(childBinding._children.length, 0)
	test.done()
}

export function listen(test) {
	test.expect(4)
	const binding = new MyBinding3()
	Core.run(MyModel, { binding, parentNode: document.body })
	test.strictEqual(observable._listeners["test"].length, 1)
	test.strictEqual(observable._listeners["test2"].length, 1)
	test.strictEqual(binding._listeners.length, 2)
	test.strictEqual(Object.keys(observable._listeners).length, 2)
	test.done()
}

export function remove(test) {
	test.expect(4)
	const binding = new MyBinding3()
	Core.run(MyModel, { binding, parentNode: document.body })
	test.strictEqual(document.body.innerHTML, '<div></div>')
	binding.remove()
	test.strictEqual(document.body.innerHTML, '')
	test.strictEqual(observable._listeners["test"].length, 0)
	test.strictEqual(observable._listeners["test2"].length, 0)
	test.done()
}
