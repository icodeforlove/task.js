const cp = require('child_process');

class NodeWorkerProxy {
	constructor ($config) {
		$config = $config || {};

		this._listeners = {};
		this._worker = cp.fork(`${__dirname}/NodeWorker.js`);
		this._worker.on('message', this._onMessage);
		this._worker.on('exit', this._onExit);
		this._worker.on('close', this._onExit);
		this._worker.on('disconnect', this._onExit);
		this._worker.on('error', this._onExit);
		this._alive = true;
		this._debug = $config.debug;
		this.id = $config.id;
		this.managerId = $config.managerId;

		this._log(`initialized`);
	}

	_log (message) {
		if (this._debug) {
			console.log(`task.js:worker-proxy[mid(${this.managerId}) wid(${this.id}) pid(${this._worker.pid})]: ${message}`);
		}
	}

	_onExit = () => {
		if (!this._alive) {
			return;
		}

		this._log(`killed`);

		this._alive = false;

		let callbacks = this._listeners.exit;
		if (callbacks) {
			callbacks.forEach(callback => callback());
		}
	}

	_onMessage = (message) => {
		let callbacks = this._listeners.message;
		if (callbacks) {
			this._log(`recieved tid(${message.id}) completion event`);
			callbacks.forEach(callback => callback(message));
		}
	}

	addEventListener(event, callback) {
		this._listeners[event] = this._listeners[event] || [];
		this._listeners[event].push(callback);
	}

	postMessage(message) {
		this._log(`sending tid(${message.id}) to worker process`);
		this._worker.send(message);
	}

	terminate () {
		this._log(`terminated`);
		this._listeners = {};
		this._worker.kill();
	}
}

module.exports = NodeWorkerProxy;