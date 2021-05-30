import { JSDOM } from 'jsdom'
import Core from '../src/core.js'
import Binding from '../src/binding.js'

const virtualDOM = new JSDOM()
const { document } = virtualDOM.window

export function setUp(callback) {
	document.body.innerHTML = ""
	callback()
}

export function model(test) {
	test.expect(1)
	Core.run({
		tagName: "div",
		className: "simplemodel",
		id: "simplemodel",
		textContent: "My first simple model"
	}, { binding: new Binding(), parentNode: document.body })
	test.strictEqual(document.body.innerHTML, '<div class="simplemodel" id="simplemodel">My first simple model</div>')
	test.done()
}

export function modelWithMultipleTargets(test) {
	test.expect(1)
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
	test.strictEqual(document.body.innerHTML, '<div class="content0"><div class="simplemodel">My first simple model</div></div><div class="content1"><div class="simplemodel">My first simple model</div></div><div class="content2"><div class="simplemodel">My first simple model</div></div>')
	test.done()
}

export function childNodes(test) {
	test.expect(1)
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
	test.strictEqual(document.body.innerHTML, '<div class="simplemodel">My first element<div class="child">My first child<div class="child">My first child child</div></div></div>')
	test.done()
}

export function insertBefore(test) {
	test.expect(1)
	document.body.innerHTML = '<ul><li>First element</li><li>Third element</li></ul>'
	Core.run({
		tagName: "li",
		textContent: "Second element"
	}, {
		binding: new Binding(),
		method: Core.METHOD.INSERT_BEFORE,
		parentNode: document.querySelector("ul li + li")
	})
	test.strictEqual(document.body.innerHTML, '<ul><li>First element</li><li>Second element</li><li>Third element</li></ul>')
	test.done()
}

export function replaceElement(test) {
	test.expect(1)
	document.body.innerHTML = '<div class="oldelement"></div>'
	Core.run({
		tagName: "span",
		className: "newelement"
	}, {
		binding: new Binding(),
		method: Core.METHOD.REPLACE_NODE,
		parentNode: document.querySelector(".oldelement")
	})
	test.strictEqual(document.body.innerHTML, '<span class="newelement"></span>')
	test.done()
}

export function wrapElement(test) {
	test.expect(1)
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
	test.strictEqual(document.body.innerHTML, '<div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div>')
	test.done()
}

export function preprend(test) {
	test.expect(1)
	document.body.innerHTML = '<ul><li>Second element</li><li>Third element</li></ul>'
	Core.run({
		tagName: "li",
		textContent: "First element"
	}, {
		binding: new Binding(),
		method: Core.METHOD.PREPEND,
		parentNode: document.querySelector("ul")
	})
	test.strictEqual(document.body.innerHTML, '<ul><li>First element</li><li>Second element</li><li>Third element</li></ul>')
	test.done()
}

export function bindings(test) {
	test.expect(1)
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
	test.strictEqual(document.body.innerHTML, '<button>bound</button>')
	test.done()
}

export function bindingProps(test) {
	test.expect(1)
	Core.run({
		tagName: "button"
	}, {
		parentNode: document.body,
		binding: new class extends Binding {
			onCreated() {
				test.strictEqual(this.properties.text, "bound")
			}
		}({text: "bound"}),
	})
	test.done()
}

export function bindingRunModel(test) {
	test.expect(1)
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
	test.strictEqual(document.body.innerHTML, '<button><button>bound</button></button>')
	test.done()
}

export function parentNode(test) {
	test.expect(1)
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
	test.strictEqual(document.body.innerHTML, '<div><button></button></div><div><button></button></div>')
	test.done()
}

export function identifiers(test) {
	test.expect(5)
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
					test.deepEqual(this.identifier.parent, this.root)
					test.deepEqual(this.identifier.child, this.root.children[0])
					test.deepEqual(this.identifier.child2, this.root.children[1])
					test.deepEqual(this.identifier.child3, this.root.children[2])
					test.deepEqual(this.identifier.childchild, this.root.children[0].children[0])
				}
			}
	})
	test.done()
}

export function modelProperty(test) {
	test.expect(5)

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
					test.deepEqual("<div>bound</div>", this.root.children[0].outerHTML)
					test.deepEqual(this.identifier.model1.root, this.root.children[1])
					test.deepEqual(this.identifier.model2.root, this.root.children[2].children[0])
					test.deepEqual(this.identifier.model2.identifier.child, this.root.children[2].children[0].children[0])
					test.deepEqual("<div>bound</div>", this.root.children[3].outerHTML)
				}
			}
	})
	test.done()
}

