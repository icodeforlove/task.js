class CompatibilityWorkerProxy {
	constructor () {
		this._listeners = {};
		this._setTimeoutID = null;
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
		this._setTimeoutID = setTimeout(() => {
			let args = Object.keys(message).filter(function (key) {
				return key.match(/^argument/);
			}).sort(function (a, b) {
				return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
			}).map(function (key) {
				return message[key];
			});

			let functionBody = message.func.substring(message.func.indexOf('{') + 1, message.func.lastIndexOf('}')),
				argNames = message.func.substring(message.func.indexOf('(') + 1, message.func.indexOf(')')).split(',');

			// we cant use eval
			let result = (new Function(...argNames, functionBody))(...args);

			this._onMessage({id: message.id, result: result});
		}, 1);
	}

	terminate () {
		clearTimeout(this._setTimeoutID);
		this._setTimeoutID = null;
	}
}

module.exports = CompatibilityWorkerProxy;