import { Observable } from "../index.js"
import test from "ava"


test("Observable instance", function(t) {
	const observable = new Observable()
	t.deepEqual(observable._listeners, {})
})

test("Observable emit", function(t) {
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
	t.deepEqual(path, [
		"zero", "first", "second", "third", "fourth"
	])
})

test("Observable removeListener", function(t) {
	const path = []
	const observable = new Observable()
	const listener = observable.listen("test", data => path.push("1_" + data))
	observable.listen("test", data => path.push(data))
	observable.emit("test", "test1")
	observable.emit("test", "test2")
	observable.removeListener(listener)
	observable.emit("test", "test3")
	observable.emit("test", "test4")
	t.deepEqual(path, [
		"1_test1", "test1", "1_test2", "test2", "test3", "test4"
	])
})

test("Observable listenerRemove", function(t) {
	const path = []
	const observable = new Observable()
	const listener = observable.listen("test", data => path.push("1_" + data))
	observable.listen("test", data => path.push(data))
	observable.emit("test", "test1")
	observable.emit("test", "test2")
	listener.remove()
	observable.emit("test", "test3")
	observable.emit("test", "test4")
	t.throws(() => {
		observable.emit("testfoo", "test4")
	}, { instanceOf: Error, message: "Cannot emit the event 'testfoo' as there is no listener for this event." }, "emitting to an event with no listener should throw an error")
	t.deepEqual(path, [
		"1_test1", "test1", "1_test2", "test2", "test3", "test4"
	])
})

