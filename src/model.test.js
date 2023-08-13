import test from "ava"

import { Model, Binding } from "../index.js"


test("Model instance", (t) => {
	const customModel = {}
	const properties = { foo: "bar" }
	const model = new Model(customModel, Binding, properties)
	t.is(model.definition, customModel)
	t.is(model.binding, Binding)
	t.is(model.properties, properties)
	t.throws(() => {
		model.definition = ""
		model.binding = ""
	})
})

