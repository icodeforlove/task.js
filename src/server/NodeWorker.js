const cp = require('child_process');
const GeneralWorker = require('../GeneralWorker');

class NodeWorker extends GeneralWorker {
	constructor ($config) {
		super(...arguments);

		$config = $config || {};

		this._worker = cp.fork(`${__dirname}/EvalWorker.js`, {
			env: $config.env
		});
		this._worker.on('message', this._onMessage);
		this._worker.on('exit', this._onExit);
		this._worker.on('close', this._onExit);
		this._worker.on('disconnect', this._onExit);
		this._worker.on('error', this._onExit);
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
			processId: this._worker.pid
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

	postMessage = (message) => {
		if (this._debug) {
			this._log({
				taskId: message.id,
				action: 'send_task_to_actual_worker',
				message: `sending taskId(${message.id}) to worker process`
			});
		}
		this._worker.send(message);
	}

	terminate = () => {
		if (this._debug) {
			this._log({
				action: 'terminated'
			});
		}
		this._worker.kill();
	}
}

module.exports = NodeWorker;