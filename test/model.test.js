import assert from "assert"

import { Model, Binding } from "../index.js"

describe("Model", () => {

	it("instance", () => {
		const customModel = {}
		const properties = { foo: "bar" }
		const model = new Model(customModel, Binding, properties)
		assert.strictEqual(model.model, customModel)
		assert.strictEqual(model.binding, Binding)
		assert.strictEqual(model.properties, properties)
		assert.throws(() => {
			model.model = ""
			model.binding = ""
		})
	})

})
