class WorkerManager {
	constructor ($config, WorkerProxy) {
		$config = $config || {};

		this.id = ++WorkerManager.managerCount;

		this._WorkerProxy = WorkerProxy;

		this._maxWorkers = $config.maxWorkers || 4;
		this._idleTimeout = $config.idleTimeout === false ? false : $config.idleTimeout;
		this._idleCheckInterval = $config.idleCheckInterval || 1000;
		this._warmStart = $config.warmStart || false;
		this._globals = $config.globals;
		this._globalsInitializationFunction = $config.initialize;
		this._debug = $config.debug;
		this._log(`creating new pool : ${JSON.stringify($config)}`);

		this._workers = [];
		this._workersInitializing = [];
		this._queue = [];
		this._onWorkerTaskComplete = this._onWorkerTaskComplete.bind(this);
		this._flushIdleWorkers = this._flushIdleWorkers.bind(this);
		this._totalWorkersCreated = 0;

		if (this._warmStart) {
			this._log(`warm starting workers`);

			for (var i = 0; i < this._maxWorkers; i++) {
				this._createWorker();
			}
		}
	}

	static managerCount = 0;
	static taskCount = 0;

	_log (message) {
		if (this._debug) {
			console.log(`task.js:manager[mid(${this.id})] ${message}`);
		}
	}

	getActiveWorkerCount () {
		return this._workersInitializing.length + this._workers.length;
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

		task.id = ++WorkerManager.taskCount;

		this._log(`added tid(${task.id}) to the queue`);

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

	_runOnWorker(worker, args, func) {
		return new Promise (function (resolve, reject) {
			worker.run({
				id: ++WorkerManager.taskCount,
				arguments: args,
				function: func,
				resolve: resolve,
				reject: reject
			});
		});
	}

	wrap (func) {
		return function () {
			var args = Array.from(arguments),
				callback = null;

			if (typeof args[args.length - 1] === 'function') {
				// apparently splice is broken in ie8
				callback = args.slice(-1).pop();
				args = args.slice(0, -1);
			}

			return this.run({
				arguments: args,
				function: func,
				callback: callback
			});
		}.bind(this);
	}

	terminate () {
		this._log(`terminated`);

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
		this._log(`sending tid(${task.id}) to wid(${worker.id})`)
		worker.run(task);
	}

	_onWorkerTaskComplete = () => {
		this._next();
	}

	_onWorkerExit = (worker) => {
		this._log(`worker died, reissuing task`);

		// purge dead worker from pool
		this._workers = this._workers.filter(item => item != worker);

		// add work back to queue
		worker.tasks.forEach(task => {
			this._queue.push(task.$options);
		});

		// run tick
		this._next();
	}

	_flushIdleWorkers () {
		this._log(`flushing idle workers`);
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
		} else if (this._workers.length < this._maxWorkers && this._workersInitializing.length === 0) {
			return this._createWorker();
		} else {
			return null;
		}
	}

	_createWorker () {
		var workerId = ++this._totalWorkersCreated;

		let worker = new this._WorkerProxy({
			debug: this._debug,
			id: workerId,
			managerId: this.id,
			onTaskComplete: this._onWorkerTaskComplete,
			onExit: this._onWorkerExit
		});

		if (this._globalsInitializationFunction || this._globals) {
			this._log(`running global initialization code`);
			var globalsInitializationFunction = `
				function (_globals) {
					globals = (${(this._globalsInitializationFunction || function (globals) {return globals}).toString()})(_globals || {});
				}
			`.trim();

			this._workersInitializing.push(worker);
			this._runOnWorker(worker, [this._globals || {}], globalsInitializationFunction).then(function () {
				this._workersInitializing = this._workersInitializing.filter(item => item != worker);
				this._workers.push(worker);
			}.bind(this));
			return null;
		} else {
			this._workers.push(worker);
			return worker;
		}
	}
}

module.exports = WorkerManager;