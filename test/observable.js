import Observable from '../src/observable.js'

export async function emit(test) {
	const path = []
	test.expect(1)
	const context1 = new Observable()
	const context2 = new Observable()
	context1.listen("test1", async () => path.push("first"))
	context1.listen("test1", async () => path.push("second"))
	context1.listen("test2", async () => path.push("third"))
	context2.listen("test1", async () => path.push("fourth"))
	await context1.emit("test1")
	await context1.emit("test2")
	await context2.emit("test1")
	test.deepEqual(path, [
		"first", "second", "third", "fourth"
	])
	test.done()
}

export async function removeListener(test) {
	test.expect(1)
	const path = []
	const context = new Observable()
	const listener = context.listen("test", async data => path.push("1_" + data))
	context.listen("test", async data => path.push(data))
	await context.emit("test", "test1")
	await context.emit("test", "test2")
	context.removeListener(listener)
	await context.emit("test", "test3")
	await context.emit("test", "test4")
	test.deepEqual(path, [
		"1_test1", "test1", "1_test2", "test2", "test3", "test4"
	])
	test.done()
}

export async function listenerRemove(test) {
	test.expect(1)
	const path = []
	const context = new Observable()
	const listener = context.listen("test", async data => path.push("1_" + data))
	context.listen("test", async data => path.push(data))
	await context.emit("test", "test1")
	await context.emit("test", "test2")
	listener.remove()
	await context.emit("test", "test3")
	await context.emit("test", "test4")
	test.deepEqual(path, [
		"1_test1", "test1", "1_test2", "test2", "test3", "test4"
	])
	test.done()
}
