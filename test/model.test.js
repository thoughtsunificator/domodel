import assert from "assert"

import { Model, Binding } from "../index.js"

describe("Model", () => {

	it("instance", () => {
		const customModel = {}
		const model = new Model(customModel, Binding)
		assert.strictEqual(model.model, customModel)
		assert.strictEqual(model.binding, Binding)
		assert.throws(() => {
			model.model = ""
			model.binding = ""
		})
	})

})
