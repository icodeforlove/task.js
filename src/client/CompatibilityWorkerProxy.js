class CompatibilityWorkerProxy {
	constructor () {
		this._listeners = {};
	}

	_onMessage = (event) => {
		let message = event;

		let callbacks = this._listeners.message;
		if (callbacks) {
			callbacks.forEach(callback => callback(message));
		}
	}

	addEventListener(event, callback) {
		this._listeners[event] = this._listeners[event] || [];
		this._listeners[event].push(callback);
	}

	postMessage(message, options) {
		// toss it out of the event loop
		setTimeout(() => {
			let args = Object.keys(message).filter(function (key) {
				return key.match(/^argument/);
			}).sort(function (a, b) {
				return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
			}).map(function (key) {
				return message[key];
			});

			this._onMessage({id: message.id, result: eval('(' + message.func + ')').apply(null, args)});
		}, 1);
	}

	terminate () {
		this._worker.terminate();
	}
}

module.exports = CompatibilityWorkerProxy;