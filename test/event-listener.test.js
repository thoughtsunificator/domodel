import assert from "assert"

import { Observable, EventListener } from "../index.js"

describe("EventListener", () => {

	it("instance", () => {
		const observable = new Observable()
		const eventListener = new EventListener(observable)
		assert.strictEqual(eventListener.observable, observable)
		const eventListener_ = new EventListener(observable)
		assert.strictEqual(eventListener_.observable, observable)
		assert.throws(() => {
			eventListener_.observable = ""
		})
	})

})
