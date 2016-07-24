class WebWorkerProxy {
	constructor () {
		this._listeners = {};
		this._worker = new Worker(this._functionToObjectURL(this.WORKER_SOURCE));
		this._worker.addEventListener('message', this._onMessage);
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

			postMessage({id: message.id, result: eval('(' + message.func + ')').apply(null, args)});
		}
	}`;

	_functionToObjectURL (func) {
		let blob,
			stringFunc = func.toString();

		stringFunc = stringFunc.substring(stringFunc.indexOf('{') + 1, stringFunc.lastIndexOf('}'))

		try {
			blob = new Blob([stringFunc], { 'type' : 'text/javascript' });
		} catch (error) { // Backwards-compatibility
			window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
			blob = new BlobBuilder();
			blob.append(stringFunc);
			blob = blob.getBlob();
		}

		return (window.URL || window.webkitURL).createObjectURL(blob);
	}

	_onMessage = (event) => {
		let message = event.data;

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
		this._worker.postMessage(message, options);
	}

	terminate () {
		this._worker.terminate();
	}
}

module.exports = WebWorkerProxy;