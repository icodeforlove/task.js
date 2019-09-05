const GeneralWorker = require('../GeneralWorker');

class NodeWorker extends GeneralWorker {
	constructor ($config) {
		super(...arguments);

		$config = $config || {};

		const { Worker } = require('worker_threads');

		this._worker = new Worker(`${__dirname}/WorkerThreadWorker.js`, {
			env: $config.env
			// TODO: DATA SUPPORT
		});
		this._worker.on('message', this._onMessage);
		this._worker.on('exit', this._onExit);
		this._worker.on('close', this._onExit);
		this._worker.on('disconnect', this._onExit);
		this._worker.on('error', this._onExit);
		this._workerThreadId = this._worker.threadId;
		this._alive = true;

		if (this._debug) {
			this._log({
				action: 'initialized'
			});
		}
	}

	_log (data) {
		let event = {
			source: 'worker_thread',
			managerId: this.managerId,
			workerId: this.id,
			threadId: this._workerThreadId
		};

		Object.keys(data).forEach(key => {
			event[key] = data[key];
		});

		if (!event.message) {
			event.message = event.action;
		}

		this._logger(event);
	}

	_onExit = () => {
		if (!this._alive) {
			return;
		}

		if (this._debug) {
			this._log({
				action: 'killed'
			});
		}

		this._alive = false;

		this.handleWorkerExit();
	}

	_onMessage = (message) => {
		this.handleWorkerMessage(message);
	}

	postMessage = (message, transferables) => {
		if (this._debug) {
			this._log({
				taskId: message.id,
				action: 'send_task_to_actual_worker',
				message: `sending taskId(${message.id}) to worker process`
			});
		}

		this._worker.postMessage(message, transferables);
	}

	terminate = () => {
		if (this._debug) {
			this._log({
				action: 'terminated'
			});
		}

		this._worker.terminate();
	}
}

module.exports = NodeWorker;