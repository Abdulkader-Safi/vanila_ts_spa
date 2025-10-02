export class Store<T> {
	private state: T
	private listeners: ((state: T) => void)[] = []

	constructor(initial: T) {
		this.state = initial
	}

	get(): T {
		return this.state
	}

	set(newState: T | ((prevState: T) => T)): void {
		if (typeof newState === "function") {
			this.state = (newState as (prevState: T) => T)(this.state)
		} else {
			this.state = newState
		}
		for (const listener of this.listeners) {
			listener(this.state)
		}
	}

	subscribe(fn: (state: T) => void): () => void {
		this.listeners.push(fn)
		// Return unsubscribe function
		return () => {
			this.listeners = this.listeners.filter((listener) => listener !== fn)
		}
	}
}
