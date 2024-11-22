import { JSDOM } from "jsdom"
import test from "ava"

import { Core, ModelChain } from "../index.js"

import { getObjectByIdentifier } from "./model-chain.js"

const myModel = {
	tagName: "div",
	id: "root",
	identifier: "root",
	children: [
		{
			tagName: "div",
			identifier: "abc",
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
	]
}

test.beforeEach((t) => {
	const virtualDOM = new JSDOM()
	const { document } = virtualDOM.window
	t.context.document = document
})

test("getObjectByIdentifier", (t) => {
	t.is(getObjectByIdentifier("root", myModel).object, myModel)
	t.is(getObjectByIdentifier("abc", myModel).object, myModel.children[0])
	t.is(getObjectByIdentifier("foo", myModel).object, myModel.children[0].children[0])
	t.is(getObjectByIdentifier("bar", myModel).object, myModel.children[0].children[1])
	t.is(getObjectByIdentifier("root", myModel).parent, null)
	t.is(getObjectByIdentifier("abc", myModel).parent, myModel)
	t.is(getObjectByIdentifier("foo", myModel).parent, myModel.children[0])
	t.is(getObjectByIdentifier("bar", myModel).parent, myModel.children[0])
})

test("basic", (t) => {
	const modelChain = new ModelChain(myModel)
	t.true(modelChain instanceof ModelChain)
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><div id="bar"></div></div></div>')
})

test("prepend root", (t) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.prepend(null, {
		tagName: "button"
	})
	t.true(operation instanceof ModelChain)
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="root"><button></button><div><div id="foo"></div><div id="bar"></div></div></div>')
})

test("prepend", (t) => {
	const modelChain = new ModelChain(myModel)
	modelChain.prepend("foo", {
		tagName: "button"
	})
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="root"><div><div id="foo"><button></button></div><div id="bar"></div></div></div>')
})

test("append root", (t) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.append(null, {
		tagName: "button"
	})
	t.true(operation instanceof ModelChain)
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><div id="bar"></div></div><button></button></div>')
})

test("append", (t) => {
	const modelChain = new ModelChain(myModel)
	modelChain.append("foo", {
		tagName: "button"
	})
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="root"><div><div id="foo"><button></button></div><div id="bar"></div></div></div>')
})

test("replace", (t) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.replace("foo", {
		tagName: "button"
	})
	t.true(operation instanceof ModelChain)
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="root"><div><button></button><div id="bar"></div></div></div>')
})

test("before", (t) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.before("bar", {
		tagName: "button"
	})
	t.true(operation instanceof ModelChain)
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><button></button><div id="bar"></div></div></div>')
})

test("after", (t) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.after("bar", {
		tagName: "button"
	})
	t.true(operation instanceof ModelChain)
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><div id="bar"></div><button></button></div></div>')
})

test("after case 2", (t) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.after("foo", { tagName: "button" })
	t.true(operation instanceof ModelChain)
	Core.run(modelChain, { parentNode: t.context.document.body })
	t.is(t.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><button></button><div id="bar"></div></div></div>')
})

