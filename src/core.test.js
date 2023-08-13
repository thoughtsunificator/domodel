import { JSDOM } from "jsdom"
import test from "ava"

import { Core, Binding, Observable, EventListener } from "../index.js"


test.beforeEach((t) => {
	const virtualDOM = new JSDOM()
	const { document } = virtualDOM.window
	t.context.document = document
})

test("model", (t) => {
	Core.run({
		tagName: "div",
		className: "simplemodel",
		id: "simplemodel",
		textContent: "My first simple model"
	}, { binding: new Binding(), parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div class="simplemodel" id="simplemodel">My first simple model</div>')
})

test("modelWithMultipleTargets", (t) => {
	t.context.document.body.innerHTML = '<div class="content0"></div><div class="content1"></div><div class="content2"></div>'
	const targets = t.context.document.querySelectorAll(".content0, .content1, .content2")
	for(const target of targets) {
		Core.run({
			tagName: "div",
			className: "simplemodel",
			property: 1,
			textContent: "My first simple model"
		}, { binding: new Binding(), parentNode: target })
	}
	t.is(t.context.document.body.innerHTML, '<div class="content0"><div class="simplemodel">My first simple model</div></div><div class="content1"><div class="simplemodel">My first simple model</div></div><div class="content2"><div class="simplemodel">My first simple model</div></div>')
})

test("model fragment", (t) => {
	Core.run({
		children: [{
			tagName: "div",
			className: "test1",
			textContent: "TestText1"
		},{
			tagName: "div",
			className: "test2",
			textContent: "TestText2"
		}]
	}, { binding: new Binding(), parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div class="test1">TestText1</div><div class="test2">TestText2</div>')
})

test("childNodes", (t) => {
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
	}, { binding: new Binding(), parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div class="simplemodel">My first element<div class="child">My first child<div class="child">My first child child</div></div></div>')
})

test("childNodes fragment", (t) => {
	Core.run({
		children: [
			{
				children: [
					{
						tagName: "div",
						className: "child",
						textContent: "My first child child"
					},
					{
						tagName: "div",
						className: "child",
						textContent: "My second child child"
					}
				]
			}
		]
	}, { binding: new Binding(), parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div class="child">My first child child</div><div class="child">My second child child</div>')
})

test("insertBefore", (t) => {
	t.context.document.body.innerHTML = "<ul><li>First element</li><li>Third element</li></ul>"
	Core.run({
		tagName: "li",
		textContent: "Second element"
	}, {
		binding: new Binding(),
		method: Core.METHOD.INSERT_BEFORE,
		parentNode: t.context.document.querySelector("ul li + li")
	})
	t.is(t.context.document.body.innerHTML, "<ul><li>First element</li><li>Second element</li><li>Third element</li></ul>")
})

test("replaceElement", (t) => {
	t.context.document.body.innerHTML = '<div class="oldelement"></div>'
	Core.run({
		tagName: "span",
		className: "newelement"
	}, {
		binding: new Binding(),
		method: Core.METHOD.REPLACE_NODE,
		parentNode: t.context.document.querySelector(".oldelement")
	})
	t.is(t.context.document.body.innerHTML, '<span class="newelement"></span>')
})

test("wrapElement", (t) => {
	t.context.document.body.innerHTML = "<textarea></textarea><textarea></textarea><textarea></textarea>"
	const textareas = t.context.document.querySelectorAll("textarea")
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
	t.is(t.context.document.body.innerHTML, '<div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div>')
})

test("preprend", (t) => {
	t.context.document.body.innerHTML = "<ul><li>Second element</li><li>Third element</li></ul>"
	Core.run({
		tagName: "li",
		textContent: "First element"
	}, {
		binding: new Binding(),
		method: Core.METHOD.PREPEND,
		parentNode: t.context.document.querySelector("ul")
	})
	t.is(t.context.document.body.innerHTML, "<ul><li>First element</li><li>Second element</li><li>Third element</li></ul>")
})

test("bindings", (t) => {
	Core.run({
		tagName: "button"
	}, {
		parentNode: t.context.document.body,
		binding: new class extends Binding {
			onCreated() {
				this.root.textContent = "bound"
			}
		}
	})
	t.is(t.context.document.body.innerHTML, "<button>bound</button>")
})

test("bindingProps", (t) => {
	return new Promise(resolve => {
		Core.run({
			tagName: "button"
		}, {
			parentNode: t.context.document.body,
			binding: new class extends Binding {
				onCreated() {
					t.is(this.properties.text, "bound")
					resolve()
				}
			}({ text: "bound" }),
		})
	})
})

test("bindingRunModel", (t) => {
	Core.run({
		tagName: "button"
	}, {
		parentNode: t.context.document.body,
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
	t.is(t.context.document.body.innerHTML, "<button><button>bound</button></button>")
})

test("parentNode", (t) => {
	t.context.document.body.innerHTML = "<div></div><div></div>"
	Core.run({
		tagName: "button"
	}, {
		binding: new Binding(),
		parentNode: t.context.document.querySelectorAll("div")[0]
	})
	Core.run({
		tagName: "button"
	}, {
		binding: new Binding(),
		parentNode: t.context.document.querySelectorAll("div")[1]
	})
	t.is(t.context.document.body.innerHTML, "<div><button></button></div><div><button></button></div>")
})

test("identifiers", (t) => {
	return new Promise(resolve => {
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
			parentNode: t.context.document.body,
			binding: new class extends Binding {
				onCreated() {
					t.deepEqual(this.identifier.parent, this.root)
					t.deepEqual(this.identifier.child, this.root.children[0])
					t.deepEqual(this.identifier.child2, this.root.children[1])
					t.deepEqual(this.identifier.child3, this.root.children[2])
					t.deepEqual(this.identifier.childchild, this.root.children[0].children[0])
					resolve()
				}
			}
		})
	})
})

test("modelProperty", (t) => {
	const Model = {
		tagName: "div"
	}

	const Model2 = {
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
	return new Promise(resolve => {
		Core.run({
			tagName: "div",
			children: [
				{
					model: Model,
					binding: MyBinding
				},
				{
					identifier: "model1",
					model: Model,
					binding: Binding
				},
				{
					tagName: "div",
					children: [
						{
							identifier: "model2",
							model: Model2,
							binding: Binding
						},
					]
				},
				{
					model: Model,
					binding: MyBinding
				}
			]
		}, {
			parentNode: t.context.document.body,
			binding: new class extends Binding {
				onCreated() {
					t.deepEqual("<div>bound</div>", this.root.children[0].outerHTML)
					t.deepEqual(this.identifier.model1.root, this.root.children[1])
					t.deepEqual(this.identifier.model2.root, this.root.children[2].children[0])
					t.deepEqual(this.identifier.model2.identifier.child, this.root.children[2].children[0].children[0])
					t.deepEqual("<div>bound</div>", this.root.children[3].outerHTML)
					resolve()
				}
			}
		})
	})
})

test("eventListener", (t) => {

	let _this
	let _myEventData
	let myEvent2 = 0
	let myEvent3 = 0

	class MyBinding extends Binding {

		constructor(properties) {
			super(properties, new MyEventListener(properties.observable))
		}

	}

	class MyEventListener extends EventListener {

		myEvent(data) {
			_this = this
			_myEventData = data
		}

		myEvent2() {
			myEvent2++
		}

		myEvent3() {
			myEvent3++
		}

	}

	const observable = new Observable()

	const binding = new MyBinding({ observable })

	Core.run({
		tagName: "div",
	}, { parentNode: t.context.document.body, binding })

	t.is(observable._listeners["myEvent"].length, 1)
	t.is(observable._listeners["myEvent"][0]._callback.prototype, binding.eventListener.myEvent.prototype)
	t.is(observable._listeners["myEvent2"].length, 1)
	t.is(observable._listeners["myEvent2"][0]._callback.prototype, binding.eventListener.myEvent2.prototype)
	t.is(observable._listeners["myEvent3"].length, 1)
	t.is(observable._listeners["myEvent3"][0]._callback.prototype, binding.eventListener.myEvent3.prototype)
	t.is(binding._listeners.length, 3)
	t.is(Object.keys(observable._listeners).length, 3)
	observable.emit("myEvent", { foo: "bar" })
	t.is(_this, binding)
	t.deepEqual(_myEventData, { foo: "bar" })
	observable.emit("myEvent2")
	observable.emit("myEvent3")
	t.is(myEvent2, 1)
	t.is(myEvent3, 1)


})

