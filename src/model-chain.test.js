import { JSDOM } from "jsdom"
import ava from "ava"

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

ava.beforeEach((test) => {
	const virtualDOM = new JSDOM()
	const { document } = virtualDOM.window
	test.context.document = document
})

ava("getObjectByIdentifier", (test) => {
	test.is(getObjectByIdentifier("root", myModel).object, myModel)
	test.is(getObjectByIdentifier("abc", myModel).object, myModel.children[0])
	test.is(getObjectByIdentifier("foo", myModel).object, myModel.children[0].children[0])
	test.is(getObjectByIdentifier("bar", myModel).object, myModel.children[0].children[1])
	test.is(getObjectByIdentifier("root", myModel).parent, null)
	test.is(getObjectByIdentifier("abc", myModel).parent, myModel)
	test.is(getObjectByIdentifier("foo", myModel).parent, myModel.children[0])
	test.is(getObjectByIdentifier("bar", myModel).parent, myModel.children[0])
})

ava("basic", (test) => {
	const modelChain = new ModelChain(myModel)
	test.true(modelChain instanceof ModelChain)
	Core.run(modelChain.definition, { target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><div id="bar"></div></div></div>')
})

ava("prepend root", (test) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.prepend(null, {
		tagName: "button"
	})
	test.true(operation instanceof ModelChain)
	Core.run(modelChain.definition, { target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="root"><button></button><div><div id="foo"></div><div id="bar"></div></div></div>')
})

ava("prepend", (test) => {
	const modelChain = new ModelChain(myModel)
	modelChain.prepend("foo", {
		tagName: "button"
	})
	Core.run(modelChain.definition, { target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="root"><div><div id="foo"><button></button></div><div id="bar"></div></div></div>')
})

ava("append root", (test) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.append(null, {
		tagName: "button"
	})
	test.true(operation instanceof ModelChain)
	Core.run(modelChain.definition, { target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><div id="bar"></div></div><button></button></div>')
})

ava("append", (test) => {
	const modelChain = new ModelChain(myModel)
	modelChain.append("foo", {
		tagName: "button"
	})
	Core.run(modelChain.definition, { target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="root"><div><div id="foo"><button></button></div><div id="bar"></div></div></div>')
})

ava("replace", (test) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.replace("foo", {
		tagName: "button"
	})
	test.true(operation instanceof ModelChain)
	Core.run(modelChain.definition, { target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="root"><div><button></button><div id="bar"></div></div></div>')
})

ava("before", (test) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.before("bar", {
		tagName: "button"
	})
	test.true(operation instanceof ModelChain)
	Core.run(modelChain.definition, { target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><button></button><div id="bar"></div></div></div>')
})

ava("after", (test) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.after("bar", {
		tagName: "button"
	})
	test.true(operation instanceof ModelChain)
	Core.run(modelChain.definition, { target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><div id="bar"></div><button></button></div></div>')
})

ava("after case 2", (test) => {
	const modelChain = new ModelChain(myModel)
	const operation = modelChain.after("foo", { tagName: "button" })
	test.true(operation instanceof ModelChain)
	Core.run(modelChain.definition, { target: test.context.document.body })
	test.is(test.context.document.body.innerHTML, '<div id="root"><div><div id="foo"></div><button></button><div id="bar"></div></div></div>')
})

