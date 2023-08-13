import test from "ava"

import { Observable, EventListener } from "../index.js"

test("EventListener instance", (t) => {
	const observable = new Observable()
	const eventListener = new EventListener(observable)
	t.is(eventListener.observable, observable)
	const eventListener_ = new EventListener(observable)
	t.is(eventListener_.observable, observable)
	t.throws(() => {
		eventListener_.observable = ""
	})
})

