import Worker from './Worker';

class WorkerManager {
	constructor ($config, WorkerProxy) {
		$config = $config || {};

		this._WorkerProxy = WorkerProxy;

		this._maxWorkers = $config.maxWorkers || 4;
		this._idleTimeout = $config.idleTimeout === false ? false : $config.idleTimeout || 10000;
		this._idleCheckInterval = $config.idleCheckInterval || 1000;

		this._workers = [];
		this._queue = [];
		this._onWorkerTaskComplete = this._onWorkerTaskComplete.bind(this);
		this._flushIdleWorkers = this._flushIdleWorkers.bind(this);
	}

	run (task) {
		if (this._idleTimeout && typeof this._idleCheckIntervalID !== 'number') {
			this._idleCheckIntervalID = setInterval(this._flushIdleWorkers, this._idleCheckInterval);
		}

		if (!task.arguments || typeof task.arguments.length === 'undefined') {
			throw new Error('task.js: "arguments" is required property, and it must be an array/array-like');
		}

		if (!task.function && (typeof task.function !== 'function' || typeof task.function !== 'string')) {
			throw new Error('task.js: "function" is required property, and it must be a string or a function');
		}

		if (typeof task.arguments === 'object') {
			task.arguments = Array.prototype.slice.call(task.arguments);
		}

		if (!task.callback) {
			return new Promise(function (resolve, reject) {
				task.resolve = resolve;
				task.reject = reject;
				this._queue.push(task);
				this._next();
			}.bind(this));
		} else {
			this._queue.push(task);
			this._next();
		}
	}

	wrap (func) {
		return function () {
			var args = Array.from(arguments),
				callback = null;

			if (typeof args[args.length - 1] === 'function') {
				callback = args.splice(-1).pop();
			}

			return this.run({
				arguments: args,
				function: func,
				callback: callback
			});
		}.bind(this);
	}

	terminate () {
		// kill idle timeout (if it exists)
		if (this._idleTimeout && typeof this._idleCheckIntervalID == 'number') {
			clearInterval(this._idleCheckIntervalID);
			this._idleCheckIntervalID = null;
		}

		// terminate all existing workers
		this._workers.forEach(function (worker) {
			worker.terminate();
		});

		// flush worker pool
		this._workers = [];
	}

	_next = () => {
		if (!this._queue.length) return;

		let worker = this._getWorker();

		if (!worker) {
			setTimeout(this._next, 0);
			return;
		}

		let task = this._queue.shift();

		worker.run(task);
	}

	_onWorkerTaskComplete () {
		this._next();
	}

	_flushIdleWorkers () {
		this._workers = this._workers.filter(function (worker) {
			if (worker.tasks.length === 0 && new Date() - worker.lastTaskTimestamp > this._idleTimeout) {
				worker.terminate();
				return false;
			} else {
				return true;
			}
		}, this);
	}

	_getWorker () {
		let idleWorkers = this._workers.filter(worker => worker.tasks.length === 0);

		if (idleWorkers.length) {
			return idleWorkers[0];
		} else if (this._workers.length < this._maxWorkers) {
			return this._createWorker();
		} else {
			return null;
		}
	}

	_createWorker () {
		let worker = new Worker({
			onTaskComplete: this._onWorkerTaskComplete
		}, this._WorkerProxy);

		this._workers.push(worker);

		return worker;
	}
}

module.exports = WorkerManager;