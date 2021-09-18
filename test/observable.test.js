import Observable from '../src/observable.js'

export function instance(test) {
	test.expect(1)
	const observable = new Observable()
	test.deepEqual(observable._listeners, {})
	test.done()
}

export function emit(test) {
	const path = []
	test.expect(1)
	const context1 = new Observable()
	const context2 = new Observable()
	context1.listen("test1", () => path.push("first"))
	context1.listen("test1", () => path.push("second"))
	context1.listen("test2", () => path.push("third"))
	context2.listen("test1", () => path.push("fourth"))
	context1.emit("test1")
	context1.emit("test2")
	context2.emit("test1")
	test.deepEqual(path, [
		"first", "second", "third", "fourth"
	])
	test.done()
}

export function removeListener(test) {
	test.expect(1)
	const path = []
	const context = new Observable()
	const listener = context.listen("test", data => path.push("1_" + data))
	context.listen("test", data => path.push(data))
	context.emit("test", "test1")
	context.emit("test", "test2")
	context.removeListener(listener)
	context.emit("test", "test3")
	context.emit("test", "test4")
	test.deepEqual(path, [
		"1_test1", "test1", "1_test2", "test2", "test3", "test4"
	])
	test.done()
}

export function listenerRemove(test) {
	test.expect(1)
	const path = []
	const context = new Observable()
	const listener = context.listen("test", data => path.push("1_" + data))
	context.listen("test", data => path.push(data))
	context.emit("test", "test1")
	context.emit("test", "test2")
	listener.remove()
	context.emit("test", "test3")
	context.emit("test", "test4")
	test.deepEqual(path, [
		"1_test1", "test1", "1_test2", "test2", "test3", "test4"
	])
	test.done()
}
