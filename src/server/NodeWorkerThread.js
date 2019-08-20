const GeneralWorker = require('../GeneralWorker');

class NodeWorker extends GeneralWorker {
	constructor ($config) {
		super(...arguments);

		$config = $config || {};

		const { Worker } = require('worker_threads');

		this._worker = new Worker(`${__dirname}/WorkerThreadWorker.js`, {
			// TODO: DATA SUPPORT
		});
		this._worker.on('message', this._onMessage);
		this._worker.on('exit', this._onExit);
		this._worker.on('close', this._onExit);
		this._worker.on('disconnect', this._onExit);
		this._worker.on('error', this._onExit);
		this._workerThreadId = this._worker.threadId;
		this._alive = true;

		this._log(`initialized`);
	}

	_log = (message) => {
		if (this._debug) {
			this._logger(`task.js:worker[managerId(${this.managerId}) workerId(${this.id}) threadId(${this._workerThreadId})]: ${message}`);
		}
	}

	_onExit = () => {
		if (!this._alive) {
			return;
		}

		this._log(`killed`);

		this._alive = false;

		this.handleWorkerExit();
	}

	_onMessage = (message) => {
		//console.log(message);
		this.handleWorkerMessage(message);
	}

	postMessage = (message) => {
		this._log(`sending taskId(${message.id}) to worker process`);
		this._worker.postMessage(message);
	}

	terminate = () => {
		this._log(`terminated`);
		this._worker.terminate();
	}
}

module.exports = NodeWorker;