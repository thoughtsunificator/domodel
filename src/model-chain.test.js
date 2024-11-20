import { JSDOM } from "jsdom"
import test from "ava"

import { Core, ModelChain } from "../index.js"

const myModel = {
	tagName: "div",
	children: [
		{
			tagName: "div",
			id: "foo",
			identifier: "foo"
		},
		{
			tagName: "div",
			id: "bar",
			identifier: "bar"
		}
	]
}

test.beforeEach((t) => {
	const virtualDOM = new JSDOM()
	const { document } = virtualDOM.window
	t.context.document = document
})

test("basic", (t) => {
	const modelChain = new ModelChain(myModel)
	t.true(modelChain instanceof ModelChain)
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div><div id="foo"></div><div id="bar"></div></div>')
})

test("prepend root", (t) => {
	const modelChain = new ModelChain(myModel)
	modelChain.prepend(null, {
		tagName: "button"
	})
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div><button></button><div id="foo"></div><div id="bar"></div></div>')
})

test("prepend", (t) => {
	const modelChain = new ModelChain(myModel)
	modelChain.prepend("foo", {
		tagName: "button"
	})
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div><div id="foo"><button></button></div><div id="bar"></div></div>')
})

test("append root", (t) => {
	const modelChain = new ModelChain(myModel)
	modelChain.append(null, {
		tagName: "button"
	})
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div><div id="foo"></div><div id="bar"></div><button></button></div>')
})

test("append", (t) => {
	const modelChain = new ModelChain(myModel)
	modelChain.append("foo", {
		tagName: "button"
	})
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div><div id="foo"><button></button></div><div id="bar"></div></div>')
})

test("replace", (t) => {
	const modelChain = new ModelChain(myModel)
	modelChain.replace("foo", {
		tagName: "button"
	})
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div><button></button><div id="bar"></div></div>')
})

test("before", (t) => {
	const modelChain = new ModelChain(myModel)
	modelChain.before("bar", {
		tagName: "button"
	})
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div><div id="foo"></div><button></button><div id="bar"></div></div>')
})

test("after", (t) => {
	const modelChain = new ModelChain(myModel)
	modelChain.after("bar", {
		tagName: "button"
	})
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div><div id="foo"></div><div id="bar"></div><button></button></div>')
})

