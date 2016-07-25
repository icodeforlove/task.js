const cp = require('child_process');

class NodeWorkerProxy {
	constructor () {
		this._listeners = {};
		this._worker = cp.fork(`${__dirname}/NodeWorker.js`);
		this._worker.on('message', this._onMessage);
		this._worker.on('exit', this._onExit);
		this._worker.on('close', this._onExit);
		this._worker.on('disconnect', this._onExit);
		this._worker.on('error', this._onExit);
		this._alive = true;
	}

	_onExit = () => {
		if (!this._alive) {
			return;
		}

		this._alive = false;

		let callbacks = this._listeners.exit;
		if (callbacks) {
			callbacks.forEach(callback => callback());
		}
	}

	_onMessage = (message) => {
		let callbacks = this._listeners.message;
		if (callbacks) {
			callbacks.forEach(callback => callback(message));
		}
	}

	addEventListener(event, callback) {
		this._listeners[event] = this._listeners[event] || [];
		this._listeners[event].push(callback);
	}

	postMessage(message) {
		this._worker.send(message);
	}

	terminate () {
		this._listeners = {};
		this._worker.kill();
	}
}

module.exports = NodeWorkerProxy;