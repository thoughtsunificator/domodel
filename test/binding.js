import { JSDOM } from 'jsdom'

import Core from '../src/core.js'
import Binding from '../src/binding.js'
import Observable from '../src/observable.js'

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
	test.expect(1)
	const MyBinding = class extends Binding {
		onCreated() {
			this.run(MyModel, { binding: new MyBinding2() })
		}
	}
	const MyBinding2 = class extends Binding {
		onCreated() {
			this.root.textContent = "test"
		}
	}
	const binding = new MyBinding()
	Core.run(MyModel, { binding, parentNode: document.body })
	test.strictEqual(document.body.innerHTML, '<div><div>test</div></div>')
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
	test.expect(3)
	const binding = new MyBinding3()
	Core.run(MyModel, { binding, parentNode: document.body })
	binding.remove()
	test.strictEqual(document.body.innerHTML, '')
	test.strictEqual(observable._listeners["test"].length, 0)
	test.strictEqual(observable._listeners["test2"].length, 0)
	test.done()
}
