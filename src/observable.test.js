import { Observable } from "../index.js"
import ava from "ava"

ava("Observable instance", function(test) {
	const observable = new Observable()
	test.deepEqual(observable._listeners, {})
})

ava("Observable emit", function(test) {
	const path = []
	const observable = new Observable()
	const observable_ = new Observable()
	observable.listen("test1", (data) => path.push(data))
	observable.listen("test1", () => path.push("second"))
	observable.listen("test2", () => path.push("third"))
	observable.listen("test3", () => {
		observable.listen("test3", () => path.push("foo"))
	})
	observable_.listen("test1", () => path.push("fourth"))
	observable.listen("test1", () => path.push("zero"), true)
	observable.emit("test1", "first")
	observable.emit("test2")
	observable.emit("test3")
	observable_.emit("test1")
	test.deepEqual(path, [
		"zero", "first", "second", "third", "fourth"
	])
})

ava("Observable emit arguments", function(test) {
	const observable = new Observable()
	const listenArguments = []
	observable.listen("event", (a,b,c) => listenArguments.push(a,b,c))
	observable.emit("event", 	"zero", "first", "second")
	test.deepEqual(listenArguments, [
		"zero", "first", "second"
	])
})

ava("Observable removeListener", function(test) {
	const path = []
	const observable = new Observable()
	const listener = observable.listen("test", data => path.push("1_" + data))
	observable.listen("test", data => path.push(data))
	observable.emit("test", "test1")
	observable.emit("test", "test2")
	observable.removeListener(listener)
	observable.emit("test", "test3")
	observable.emit("test", "test4")
	test.deepEqual(path, [
		"1_test1", "test1", "1_test2", "test2", "test3", "test4"
	])
})

ava("Observable listenerRemove", function(test) {
	const path = []
	const observable = new Observable()
	const listener = observable.listen("test", data => path.push("1_" + data))
	observable.listen("test", data => path.push(data))
	observable.emit("test", "test1")
	observable.emit("test", "test2")
	listener.remove()
	observable.emit("test", "test3")
	observable.emit("test", "test4")
	test.throws(() => {
		observable.emit("testfoo", "test4")
	}, { instanceOf: Error, message: "Cannot emit the event 'testfoo' as there is no listener for this event." }, "emitting to an event with no listener should throw an error")
	test.deepEqual(path, [
		"1_test1", "test1", "1_test2", "test2", "test3", "test4"
	])
})

