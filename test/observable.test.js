import assert from 'assert'
import { Observable } from '../index.js'

describe("observable", function () {
	it("instance", function() {
		const observable = new Observable()
		assert.deepEqual(observable._listeners, {})
	})

	it("emit", function() {
		const path = []
		const context1 = new Observable()
		const context2 = new Observable()
		context1.listen("test1", () => path.push("first"))
		context1.listen("test1", () => path.push("second"))
		context1.listen("test2", () => path.push("third"))
		context2.listen("test1", () => path.push("fourth"))
		context1.emit("test1")
		context1.emit("test2")
		context2.emit("test1")
		assert.deepEqual(path, [
			"first", "second", "third", "fourth"
		])
	})

	it("removeListener", function() {
		const path = []
		const context = new Observable()
		const listener = context.listen("test", data => path.push("1_" + data))
		context.listen("test", data => path.push(data))
		context.emit("test", "test1")
		context.emit("test", "test2")
		context.removeListener(listener)
		context.emit("test", "test3")
		context.emit("test", "test4")
		assert.deepEqual(path, [
			"1_test1", "test1", "1_test2", "test2", "test3", "test4"
		])
	})

	it("listenerRemove", function() {
		const path = []
		const context = new Observable()
		const listener = context.listen("test", data => path.push("1_" + data))
		context.listen("test", data => path.push(data))
		context.emit("test", "test1")
		context.emit("test", "test2")
		listener.remove()
		context.emit("test", "test3")
		context.emit("test", "test4")
		assert.deepEqual(path, [
			"1_test1", "test1", "1_test2", "test2", "test3", "test4"
		])
	})
})
