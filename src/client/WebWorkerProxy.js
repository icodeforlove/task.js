import functionToObjectURL from './functionToObjectURL';

class WebWorkerProxy {
	constructor ($config) {
		$config = $config || {};

		this._listeners = {};
		this._debug = $config.debug;
		this.id = $config.id;
		this.managerId = $config.managerId;
		this._worker = new Worker(functionToObjectURL(this.WORKER_SOURCE));
		this._worker.addEventListener('message', this._onMessage);

		this._log(`initialized`);
	}

	_log (message) {
		if (this._debug) {
			console.log(`task.js:worker-proxy[mid(${this.managerId}) wid(${this.id})]: ${message}`);
		}
	}

	WORKER_SOURCE = `function () {
		onmessage = function (event) {
			var message = event.data;

			var args = Object.keys(message).filter(function (key) {
				return key.match(/^argument/);
			}).sort(function (a, b) {
				return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
			}).map(function (key) {
				return message[key];
			});

			try {
				postMessage({id: message.id, result: eval('(' + message.func + ')').apply(null, args)});
			} catch (error) {
				postMessage({id: message.id, error: error.message});
			}
		}
	}`;

	_onMessage = (event) => {
		let message = event.data;

		let callbacks = this._listeners.message;
		if (callbacks) {
			this._log(`recieved task completion event`);
			callbacks.forEach(callback => callback(message));
		}
	}

	addEventListener(event, callback) {
		this._listeners[event] = this._listeners[event] || [];
		this._listeners[event].push(callback);
	}

	postMessage(message, options) {
		this._log(`sending tid(${message.id}) to worker process`);
		this._worker.postMessage(message, options);
	}

	terminate () {
		this._log(`terminated`);
		this._worker.terminate();
	}
}

module.exports = WebWorkerProxy;