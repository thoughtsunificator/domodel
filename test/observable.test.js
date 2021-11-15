import assert from 'assert'
import { Observable } from '../index.js'

describe("Observable", function () {

	it("instance", function() {
		const observable = new Observable()
		assert.deepEqual(observable._listeners, {})
	})

	it("emit", function() {
		const path = []
		const observable = new Observable()
		const observable_ = new Observable()
		observable.listen("test1", () => path.push("first"))
		observable.listen("test1", () => path.push("second"))
		observable.listen("test2", () => path.push("third"))
		observable.listen("test3", () => {
			observable.listen("test3", () => path.push("foo"))
		})
		observable_.listen("test1", () => path.push("fourth"))
		observable.listen("test1", () => path.push("zero"), true)
		observable.emit("test1")
		observable.emit("test2")
		observable.emit("test3")
		observable_.emit("test1")
		assert.deepEqual(path, [
			"zero", "first", "second", "third", "fourth"
		])
	})

	it("removeListener", function() {
		const path = []
		const observable = new Observable()
		const listener = observable.listen("test", data => path.push("1_" + data))
		observable.listen("test", data => path.push(data))
		observable.emit("test", "test1")
		observable.emit("test", "test2")
		observable.removeListener(listener)
		observable.emit("test", "test3")
		observable.emit("test", "test4")
		assert.deepEqual(path, [
			"1_test1", "test1", "1_test2", "test2", "test3", "test4"
		])
	})

	it("listenerRemove", function() {
		const path = []
		const observable = new Observable()
		const listener = observable.listen("test", data => path.push("1_" + data))
		observable.listen("test", data => path.push(data))
		observable.emit("test", "test1")
		observable.emit("test", "test2")
		listener.remove()
		observable.emit("test", "test3")
		observable.emit("test", "test4")
		assert.deepEqual(path, [
			"1_test1", "test1", "1_test2", "test2", "test3", "test4"
		])
	})

})
