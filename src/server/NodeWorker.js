import cp from 'child_process';
import GeneralWorker from '../GeneralWorker';

class NodeWorker extends GeneralWorker {
	constructor ($config) {
		super(...arguments);

		$config = $config || {};

		this._worker = cp.fork(`${__dirname}/EvalWorker.js`);
		this._worker.on('message', this._onMessage);
		this._worker.on('exit', this._onExit);
		this._worker.on('close', this._onExit);
		this._worker.on('disconnect', this._onExit);
		this._worker.on('error', this._onExit);
		this._alive = true;

		this._log(`initialized`);
	}

	_log = (message) => {
		if (this._debug) {
			this._logger(`task.js:worker[mid(${this.managerId}) wid(${this.id}) pid(${this._worker.pid})]: ${message}`);
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
		this.handleWorkerMessage(message);
	}

	postMessage = (message) => {
		this._log(`sending tid(${message.id}) to worker process`);
		this._worker.send(message);
	}

	terminate = () => {
		this._log(`terminated`);
		this._worker.kill();
	}
}

module.exports = NodeWorker;