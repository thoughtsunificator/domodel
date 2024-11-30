import { JSDOM } from "jsdom"
import ava from "ava"

import { Core, Binding, Observable, EventListener } from "../index.js"

ava.beforeEach((test) => {
	const virtualDOM = new JSDOM()
	const { document } = virtualDOM.window
	test.context.document = document
})

ava("model", (test) => {
	Core.run({
		tagName: "div",
		className: "simplemodel",
		id: "simplemodel",
		textContent: "My first simple model"
	}, { binding: new Binding(), target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div class="simplemodel" id="simplemodel">My first simple model</div>')
})

ava("multiple targets", (test) => {
	test.context.document.body.innerHTML = '<div class="content0"></div><div class="content1"></div><div class="content2"></div>'
	const targets = test.context.document.querySelectorAll(".content0, .content1, .content2")
	for(const target of targets) {
		Core.run({
			tagName: "div",
			className: "simplemodel",
			attributes: {
				property: 1
			},
			textContent: "My first simple model"
		}, { binding: new Binding(), target: target })
	}
	test.is(test.context.document.body.innerHTML, '<div class="content0"><div class="simplemodel" property="1">My first simple model</div></div><div class="content1"><div class="simplemodel" property="1">My first simple model</div></div><div class="content2"><div class="simplemodel" property="1">My first simple model</div></div>')
})

ava("childNodes", (test) => {
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
	}, { binding: new Binding(), target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div class="simplemodel">My first element<div class="child">My first child<div class="child">My first child child</div></div></div>')
})

ava("insertBefore", (test) => {
	test.context.document.body.innerHTML = "<ul><li>First element</li><li>Third element</li></ul>"
	Core.run({
		tagName: "li",
		textContent: "Second element"
	}, {
		binding: new Binding(),
		method: Core.METHOD.INSERT_BEFORE,
		target: test.context.document.querySelector("ul li + li")
	})
	test.is(test.context.document.body.innerHTML, "<ul><li>First element</li><li>Second element</li><li>Third element</li></ul>")
})

ava("insertAfter", (test) => {
	test.context.document.body.innerHTML = "<ul><li>First element</li><li>Third element</li></ul>"
	Core.run({
		tagName: "li",
		textContent: "Second element"
	}, {
		binding: new Binding(),
		method: Core.METHOD.INSERT_AFTER,
		target: test.context.document.querySelector("ul li + li")
	})
	test.is(test.context.document.body.innerHTML, "<ul><li>First element</li><li>Third element</li><li>Second element</li></ul>")
})

ava("replaceElement", (test) => {
	test.context.document.body.innerHTML = '<div class="oldelement"></div>'
	Core.run({
		tagName: "span",
		className: "newelement"
	}, {
		binding: new Binding(),
		method: Core.METHOD.REPLACE_NODE,
		target: test.context.document.querySelector(".oldelement")
	})
	test.is(test.context.document.body.innerHTML, '<span class="newelement"></span>')
})

ava("wrapElement", (test) => {
	test.context.document.body.innerHTML = "<textarea></textarea><textarea></textarea><textarea></textarea>"
	const textareas = test.context.document.querySelectorAll("textarea")
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
			target: textarea
		})
	}
	test.is(test.context.document.body.innerHTML, '<div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div>')
})

ava("preprend", (test) => {
	test.context.document.body.innerHTML = "<ul><li>Second element</li><li>Third element</li></ul>"
	Core.run({
		tagName: "li",
		textContent: "First element"
	}, {
		binding: new Binding(),
		method: Core.METHOD.PREPEND,
		target: test.context.document.querySelector("ul")
	})
	test.is(test.context.document.body.innerHTML, "<ul><li>First element</li><li>Second element</li><li>Third element</li></ul>")
})

ava("bindings", (test) => {
	Core.run({
		tagName: "button"
	}, {
		target: test.context.document.body,
		binding: new class extends Binding {
			onCreated() {
				this.root.textContent = "bound"
			}
		}
	})
	test.is(test.context.document.body.innerHTML, "<button>bound</button>")
})


ava("onConnected", (test) => {
	Core.run({
		tagName: "button"
	}, {
		target: test.context.document.body,
		binding: new class extends Binding {
			onConnected() {
				this.root.textContent = "rendered"
			}
		}
	})
	test.is(test.context.document.body.innerHTML, "<button>rendered</button>")
})

ava("bindingRunModel", (test) => {
	Core.run({
		tagName: "button"
	}, {
		target: test.context.document.body,
		binding: new class extends Binding {
			onCreated() {
				Core.run({
					tagName: "button"
				}, {
					target: this.root,
					binding: new class extends Binding {
						onCreated() {
							this.root.textContent = "bound"
						}
					}
				})
			}
		}
	})
	test.is(test.context.document.body.innerHTML, "<button><button>bound</button></button>")
})

ava("target", (test) => {
	test.context.document.body.innerHTML = "<div></div><div></div>"
	Core.run({
		tagName: "button"
	}, {
		binding: new Binding(),
		target: test.context.document.querySelectorAll("div")[0]
	})
	Core.run({
		tagName: "button"
	}, {
		binding: new Binding(),
		target: test.context.document.querySelectorAll("div")[1]
	})
	test.is(test.context.document.body.innerHTML, "<div><button></button></div><div><button></button></div>")
})

ava("identifiers", (test) => {
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
			target: test.context.document.body,
			binding: new class extends Binding {
				onCreated() {
					test.deepEqual(this.elements.parent, this.root)
					test.deepEqual(this.elements.child, this.root.children[0])
					test.deepEqual(this.elements.child2, this.root.children[1])
					test.deepEqual(this.elements.child3, this.root.children[2])
					test.deepEqual(this.elements.childchild, this.root.children[0].children[0])
					resolve()
				}
			}
		})
	})
})

ava("modelProperty", (test) => {
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
					childModel: {
						model: Model,
						binding: MyBinding
					}
				},
				{
					childModel: {
						identifier: "model1",
						model: Model,
						binding: Binding
					}
				},
				{
					tagName: "div",
					children: [
						{
							childModel: {
								identifier: "model2",
								model: Model2,
								binding: Binding
							}
						},
					]
				},
				{
					childModel: {
						model: Model,
						binding: MyBinding
					}
				}
			]
		}, {
			target: test.context.document.body,
			binding: new class extends Binding {
				onCreated() {
					test.deepEqual("<div>bound</div>", this.root.children[0].outerHTML)
					test.deepEqual(this.elements.model1, this.root.children[1])
					test.deepEqual(this.elements.model2, this.root.children[2].children[0])
					test.deepEqual(this.identifier.model2.binding.elements.child, this.root.children[2].children[0].children[0])
					test.deepEqual("<div>bound</div>", this.root.children[3].outerHTML)
					resolve()
				}
			}
		})
	})
})

ava("eventListener", (test) => {

	let _this
	let _myEventData
	let myEvent2 = 0
	let myEvent3 = 0

	class MyBinding extends Binding {

		constructor() {
			super(new MyEventListener(observable))
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

	const binding = new MyBinding(observable)

	Core.run({
		tagName: "div",
	}, { target: test.context.document.body, binding })

	test.is(observable._listeners["myEvent"].length, 1)
	test.is(observable._listeners["myEvent"][0].callback.prototype, binding.eventListener.myEvent.prototype)
	test.is(observable._listeners["myEvent2"].length, 1)
	test.is(observable._listeners["myEvent2"][0].callback.prototype, binding.eventListener.myEvent2.prototype)
	test.is(observable._listeners["myEvent3"].length, 1)
	test.is(observable._listeners["myEvent3"][0].callback.prototype, binding.eventListener.myEvent3.prototype)
	test.is(binding.listeners.length, 3)
	test.is(Object.keys(observable._listeners).length, 3)
	observable.emit("myEvent", { foo: "bar" })
	test.is(_this, binding)
	test.deepEqual(_myEventData, { foo: "bar" })
	observable.emit("myEvent2")
	observable.emit("myEvent3")
	test.is(myEvent2, 1)
	test.is(myEvent3, 1)


})

ava("eventListener inheritance", (test) => {

	let mySuperEvent = 0
	let myEvent = 0

	class MyBinding extends Binding {

		constructor(observable) {
			super(new MyEventListener(observable))
		}

	}

	class MySuperEventListener extends EventListener {
		mySuperEvent() {
			mySuperEvent++
		}
		myEvent() {
		}
	}

	class MyEventListener extends MySuperEventListener {

		myEvent() {
			myEvent++
		}

		myEvent2() {
		}

		myEvent3() {
		}

	}

	const observable = new Observable()

	const binding = new MyBinding(observable)

	Core.run({
		tagName: "div",
	}, { target: test.context.document.body, binding })

	test.is(binding.listeners.length, 4)
	observable.emit("mySuperEvent")
	observable.emit("myEvent")
	test.is(mySuperEvent, 1)
	test.is(myEvent, 1)


})
