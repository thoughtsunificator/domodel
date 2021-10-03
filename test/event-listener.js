import assert from "assert"

import { Observable, Binding, EventListener } from "../index.js"

describe("EventListener", () => {

	it("instance", () => {
		const observable = new Observable()
		const eventListener = new EventListener(observable)
		assert.strictEqual(eventListener.observable, observable)
		const binding = new Binding()
		const eventListener_ = new EventListener(observable)
		assert.strictEqual(eventListener_.observable, observable)
		assert.throws(() => {
			eventListener_.observable = ""
			eventListener_.binding = ""
		})
	})

})
