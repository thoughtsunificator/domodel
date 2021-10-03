import assert from 'assert'
import { JSDOM } from 'jsdom'

import { Core, Binding, Observable, EventListener } from '../index.js'

const virtualDOM = new JSDOM()
const { document } = virtualDOM.window

beforeEach(() => {
	document.body.innerHTML = ""
})

describe("core", function () {
	it("model", () => {
		Core.run({
			tagName: "div",
			className: "simplemodel",
			id: "simplemodel",
			textContent: "My first simple model"
		}, { binding: new Binding(), parentNode: document.body })
		assert.strictEqual(document.body.innerHTML, '<div class="simplemodel" id="simplemodel">My first simple model</div>')
	})

	it("modelWithMultipleTargets", () => {
		document.body.innerHTML = '<div class="content0"></div><div class="content1"></div><div class="content2"></div>'
		const targets = document.querySelectorAll(".content0, .content1, .content2")
		for(const target of targets) {
			Core.run({
				tagName: "div",
				className: "simplemodel",
				property: 1,
				textContent: "My first simple model"
			}, { binding: new Binding(), parentNode: target })
		}
		assert.strictEqual(document.body.innerHTML, '<div class="content0"><div class="simplemodel">My first simple model</div></div><div class="content1"><div class="simplemodel">My first simple model</div></div><div class="content2"><div class="simplemodel">My first simple model</div></div>')
	})

	it("childNodes", () => {
		Core.run({
			tagName: "div",
			className: "simplemodel",
			textContent: "My first element",
			children: [
				{
					tagName: "div",
					className: "child",
					textContent: "My first child",
					children: [
						{
							tagName: "div",
							className: "child",
							textContent: "My first child child"
						}
					]
				}
			]
		}, { binding: new Binding(), parentNode: document.body })
		assert.strictEqual(document.body.innerHTML, '<div class="simplemodel">My first element<div class="child">My first child<div class="child">My first child child</div></div></div>')
	})

	it("insertBefore", () => {
		document.body.innerHTML = '<ul><li>First element</li><li>Third element</li></ul>'
		Core.run({
			tagName: "li",
			textContent: "Second element"
		}, {
			binding: new Binding(),
			method: Core.METHOD.INSERT_BEFORE,
			parentNode: document.querySelector("ul li + li")
		})
		assert.strictEqual(document.body.innerHTML, '<ul><li>First element</li><li>Second element</li><li>Third element</li></ul>')
	})

	it("replaceElement", () => {
		document.body.innerHTML = '<div class="oldelement"></div>'
		Core.run({
			tagName: "span",
			className: "newelement"
		}, {
			binding: new Binding(),
			method: Core.METHOD.REPLACE_NODE,
			parentNode: document.querySelector(".oldelement")
		})
		assert.strictEqual(document.body.innerHTML, '<span class="newelement"></span>')
	})

	it("wrapElement", () => {
		document.body.innerHTML = '<textarea></textarea><textarea></textarea><textarea></textarea>'
		const textareas = document.querySelectorAll("textarea")
		for(const textarea of textareas) {
			Core.run({
				tagName: "div",
				className: "wrapper",
				children: [
					{
					tagName: "p",
					}
				]
			}, {
				binding: new Binding(),
				method: Core.METHOD.WRAP_NODE,
				parentNode: textarea
			})
		}
		assert.strictEqual(document.body.innerHTML, '<div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div>')
	})

	it("preprend", () => {
		document.body.innerHTML = '<ul><li>Second element</li><li>Third element</li></ul>'
		Core.run({
			tagName: "li",
			textContent: "First element"
		}, {
			binding: new Binding(),
			method: Core.METHOD.PREPEND,
			parentNode: document.querySelector("ul")
		})
		assert.strictEqual(document.body.innerHTML, '<ul><li>First element</li><li>Second element</li><li>Third element</li></ul>')
	})

	it("bindings", () => {
		Core.run({
			tagName: "button"
		}, {
			parentNode: document.body,
			binding: new class extends Binding {
				onCreated() {
					this.root.textContent = "bound"
				}
			}
		})
		assert.strictEqual(document.body.innerHTML, '<button>bound</button>')
	})

	it("bindingProps", (done) => {
		Core.run({
			tagName: "button"
		}, {
			parentNode: document.body,
			binding: new class extends Binding {
				onCreated() {
					assert.strictEqual(this.properties.text, "bound")
					done()
				}
			}({text: "bound"}),
		})
	})

	it("bindingRunModel", () => {
		Core.run({
				tagName: "button"
		}, {
			parentNode: document.body,
			binding: new class extends Binding {
				onCreated() {
					Core.run({
						tagName: "button"
					}, {
						parentNode: this.root,
						binding: new class extends Binding {
							onCreated() {
								this.root.textContent = "bound"
							}
						}
					})
				}
			}
		})
		assert.strictEqual(document.body.innerHTML, '<button><button>bound</button></button>')
	})

	it("parentNode", () => {
		document.body.innerHTML = "<div></div><div></div>"
		Core.run({
			tagName: "button"
		}, {
			binding: new Binding(),
			parentNode: document.querySelectorAll("div")[0]
		})
		Core.run({
			tagName: "button"
		}, {
			binding: new Binding(),
			parentNode: document.querySelectorAll("div")[1]
		})
		assert.strictEqual(document.body.innerHTML, '<div><button></button></div><div><button></button></div>')
	})

	it("identifiers", (done) => {
		Core.run({
				tagName: "div",
				identifier: "parent",
				children: [
					{
						tagName: "div",
						identifier: "child",
						children: [
							{
								tagName: "div",
								identifier: "childchild"
							}
						]
					},
					{
						tagName: "div",
						identifier: "child2"
					}
				]
			}, {
				parentNode: document.body,
				binding: new class extends Binding {
					onCreated() {
						assert.deepEqual(this.identifier.parent, this.root)
						assert.deepEqual(this.identifier.child, this.root.children[0])
						assert.deepEqual(this.identifier.child2, this.root.children[1])
						assert.deepEqual(this.identifier.child3, this.root.children[2])
						assert.deepEqual(this.identifier.childchild, this.root.children[0].children[0])
						done()
					}
				}
		})
	})

	it("modelProperty", (done) => {

		const MyModel = {
			tagName: "div"
		}

		const MyModel2 = {
			tagName: "div",
			children: [
				{
					tagName: "div",
					identifier: "child"
				}
			]
		}

		const MyBinding = class extends Binding {

			onCreated() {
				this.root.textContent = "bound"
			}

		}

		Core.run({
				tagName: "div",
				children: [
					{
						model: MyModel,
						binding: MyBinding
					},
					{
						identifier: "model1",
						model: MyModel,
						binding: Binding
					},
					{
						tagName: "div",
						children: [
							{
								identifier: "model2",
								model: MyModel2,
								binding: Binding
							},
						]
					},
					{
						model: MyModel,
						binding: MyBinding
					}
				]
			}, {
				parentNode: document.body,
				binding: new class extends Binding {
					onCreated() {
						assert.deepEqual("<div>bound</div>", this.root.children[0].outerHTML)
						assert.deepEqual(this.identifier.model1.root, this.root.children[1])
						assert.deepEqual(this.identifier.model2.root, this.root.children[2].children[0])
						assert.deepEqual(this.identifier.model2.identifier.child, this.root.children[2].children[0].children[0])
						assert.deepEqual("<div>bound</div>", this.root.children[3].outerHTML)
						done()
					}
				}
		})
	})

	it("eventListener", () => {

		let _this

		class MyEventListener extends EventListener {

			myEvent() {
				_this = this
			}

			myEvent2() {}

			myEvent3() {}

		}

		const myObservable = new Observable()

		const eventListener = new MyEventListener(myObservable)

		const binding = new Binding({ myObservable }, eventListener)

		assert.strictEqual(binding.eventListener, eventListener)

		Core.run({
			tagName: "div",
		}, { parentNode: document.body, binding })

		assert.strictEqual(myObservable._listeners["myEvent"].length, 1)
		assert.strictEqual(eventListener.binding, binding)
		assert.strictEqual(myObservable._listeners["myEvent"][0]._callback.prototype, eventListener.myEvent.prototype)
		assert.strictEqual(myObservable._listeners["myEvent2"].length, 1)
		assert.strictEqual(myObservable._listeners["myEvent2"][0]._callback.prototype, eventListener.myEvent2.prototype)
		assert.strictEqual(myObservable._listeners["myEvent3"].length, 1)
		assert.strictEqual(myObservable._listeners["myEvent3"][0]._callback.prototype, eventListener.myEvent3.prototype)
		assert.strictEqual(binding._listeners.length, 3)
		assert.strictEqual(Object.keys(myObservable._listeners).length, 3)
		myObservable.emit("myEvent")
		assert.strictEqual(_this, eventListener)


	})

})
