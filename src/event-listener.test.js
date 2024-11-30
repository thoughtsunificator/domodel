import ava from "ava"

import { Observable, EventListener } from "../index.js"

ava("EventListener instance", (test) => {
	const observable = new Observable()
	const eventListener = new EventListener(observable)
	test.is(eventListener.observable, observable)
	const eventListener_ = new EventListener(observable)
	test.is(eventListener_.observable, observable)
})

