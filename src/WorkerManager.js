class WorkerManager {
	constructor ($config, WorkerProxies) {
		$config = $config || {};

		this.id = ++WorkerManager.managerCount;

		if ($config.workerType === 'worker_threads') {
			try {
				require('worker_threads');
			} catch (error) {
				console.error('Your current version, or configuration of Node.js does not support worker_threads.')
				process.exit(1);
			}
			this._WorkerProxy = WorkerProxies.NodeWorkerThread;
		} else if ($config.workerType == 'compatibility_worker') {
			this._WorkerProxy = WorkerProxies.CompatibilityWorker;
		} else {
			this._WorkerProxy = WorkerProxies.DefaultWorkerProxy;
		}

		this._logger = $config.logger || console.log;

		this._workerTaskConcurrency = ($config.workerTaskConcurrency || 1) - 1;
		this._maxWorkers = $config.maxWorkers || 4;
		this._idleTimeout = $config.idleTimeout === false ? false : $config.idleTimeout;
		this._taskTimeout = $config.taskTimeout || 0;
		this._idleCheckInterval = $config.idleCheckInterval || 1000;
		this._warmStart = $config.warmStart || false;
		this._globals = $config.globals;
		this._globalsInitializationFunction = $config.initialize;
		this._debug = $config.debug;

		if (this._debug) {
			this._log({
				action: 'create_new_pool',
				message: `creating new pool : ${JSON.stringify($config)}`,
				config: $config
			});
		}

		this._workers = [];
		this._workersInitializing = [];
		this._queue = [];
		this._onWorkerTaskComplete = this._onWorkerTaskComplete.bind(this);
		this._flushIdleWorkers = this._flushIdleWorkers.bind(this);
		this._totalWorkersCreated = 0;
		this._lastTaskTimeoutCheck = new Date();

		if (this._warmStart) {
			if (this._debug) {
				this._log({
					action: 'warmstart',
					message: 'warm starting workers'
				});
			}

			for (var i = 0; i < this._maxWorkers; i++) {
				this._createWorker();
			}
		}
	}

	static managerCount = 0;
	static taskCount = 0;

	_log (data) {
		let event = {
			source: 'manager',
			managerId: this.id
		};

		Object.keys(data).forEach(key => {
			event[key] = data[key];
		});

		if (!event.message) {
			event.message = event.action;
		}

		this._logger(event);
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

		if (this._debug) {
			this._log({
				action: 'add_to_queue',
				taskId: task.id,
				message: `added taskId(${task.id}) to the queue`
			});
		}

		return new Promise(function (resolve, reject) {
			task.resolve = resolve;
			task.reject = reject;
			this._queue.push(task);
			this._next();
		}.bind(this));
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

	wrap (func, {useTransferables} = {useTransferables: false}) {
		return function () {
			var args = Array.from(arguments),
				transferables = null;

			if (useTransferables) {
				transferables = args.slice(-1)[0];
				if (!Array.isArray(transferables)) {
					throw new Error('Task expects to be passed a transferables array as its last argument.')
				}
				args = args.slice(0, -1);
			}

			return this.run({
				arguments: args,
				transferables,
				function: func
			});
		}.bind(this);
	}

	terminate () {
		if (this._debug) {
			this._log({
				action: 'terminated',
				message: 'terminated'
			});
		}

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

	_reissueTasksInTimedoutWorkers () {
		if (new Date () - this._lastTaskTimeoutCheck < 5000) {
			return;
		}

		this._lastTaskTimeoutCheck = new Date();

		this._workers.forEach(worker => {
			worker.tasks.some(task => {
				if (new Date() - task.startTime >= this._taskTimeout) {
					worker.forceExit();
					return true;
				}
			});
		});
	}

	_next = () => {
		if (this._taskTimeout) {
			this._reissueTasksInTimedoutWorkers();
		}

		if (!this._queue.length) {
			return;
		}

		let worker = this._getWorker();

		if (!worker) {
			setTimeout(this._next, 0);
			return;
		}

		let task = this._queue.shift();
		if (this._debug) {
			this._log({
				action: 'send_task_to_worker',
				taskId: task.id,
				workerId: worker.id,
				message: `sending taskId(${task.id}) to workerId(${worker.id})`
			});
		}
		worker.run(task);
	}

	_onWorkerTaskComplete = () => {
		this._next();
	}

	_onWorkerExit = (worker) => {
		if (this._debug) {
			this._log({
				action: 'worker_died',
				workerId: worker.id,
				message: `worker died, reissuing tasks`
			});
		}

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
		if (this._debug) {
			this._log({
				action: 'flush_idle_workers',
				message: `flushing idle workers`
			});
		}

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
		let idleWorkers = this._workers
			.filter(worker => worker.tasks.length <= this._workerTaskConcurrency)
			.sort((a, b) => a.tasks.length - b.tasks.length);

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
			logger: this._logger,
			id: workerId,
			managerId: this.id,
			onTaskComplete: this._onWorkerTaskComplete,
			onExit: this._onWorkerExit
		});

		if (this._globalsInitializationFunction || this._globals) {
			if (this._debug) {
				this._log({
					action: 'run_global_initialize',
					message: `running global initialization code`
				});
			}

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