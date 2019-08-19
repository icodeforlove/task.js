'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkerManager = function () {
	function WorkerManager($config, WorkerProxies) {
		var _this = this;

		_classCallCheck(this, WorkerManager);

		this.decorate = function (target, key) {
			target[key] = _this.wrap(target[key]);
			return target;
		};

		this._next = function () {
			if (_this._taskTimeout) {
				_this._reissueTasksInTimedoutWorkers();
			}

			if (!_this._queue.length) {
				return;
			}

			var worker = _this._getWorker();

			if (!worker) {
				setTimeout(_this._next, 0);
				return;
			}

			var task = _this._queue.shift();
			_this._log('sending taskId(' + task.id + ') to workerId(' + worker.id + ')');
			worker.run(task);
		};

		this._onWorkerTaskComplete = function () {
			_this._next();
		};

		this._onWorkerExit = function (worker) {
			_this._log('worker died, reissuing task');

			// purge dead worker from pool
			_this._workers = _this._workers.filter(function (item) {
				return item != worker;
			});

			// add work back to queue
			worker.tasks.forEach(function (task) {
				_this._queue.push(task.$options);
			});

			// run tick
			_this._next();
		};

		$config = $config || {};

		this.id = ++WorkerManager.managerCount;

		if ($config.workerType === 'worker_threads') {
			try {
				require('worker_threads');
			} catch (error) {
				console.error('Your current version, or configuration of Node.js does not support worker_threads.');
				process.exit(1);
			}
			this._WorkerProxy = WorkerProxies.NodeWorkerThread;
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
		this._log('creating new pool : ' + JSON.stringify($config));

		this._workers = [];
		this._workersInitializing = [];
		this._queue = [];
		this._onWorkerTaskComplete = this._onWorkerTaskComplete.bind(this);
		this._flushIdleWorkers = this._flushIdleWorkers.bind(this);
		this._totalWorkersCreated = 0;
		this._lastTaskTimeoutCheck = new Date();

		if (this._warmStart) {
			this._log('warm starting workers');

			for (var i = 0; i < this._maxWorkers; i++) {
				this._createWorker();
			}
		}
	}

	WorkerManager.prototype._log = function _log(message) {
		if (this._debug) {
			this._logger('task.js:manager[managerId(' + this.id + ')] ' + message);
		}
	};

	WorkerManager.prototype.getActiveWorkerCount = function getActiveWorkerCount() {
		return this._workersInitializing.length + this._workers.length;
	};

	WorkerManager.prototype.run = function run(task) {
		if (this._idleTimeout && typeof this._idleCheckIntervalID !== 'number') {
			this._idleCheckIntervalID = setInterval(this._flushIdleWorkers, this._idleCheckInterval);
		}

		if (!task.arguments || typeof task.arguments.length === 'undefined') {
			throw new Error('task.js: "arguments" is required property, and it must be an array/array-like');
		}

		if (!task.function && (typeof task.function !== 'function' || typeof task.function !== 'string')) {
			throw new Error('task.js: "function" is required property, and it must be a string or a function');
		}

		if (_typeof(task.arguments) === 'object') {
			task.arguments = Array.prototype.slice.call(task.arguments);
		}

		task.id = ++WorkerManager.taskCount;

		this._log('added taskId(' + task.id + ') to the queue');

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
	};

	WorkerManager.prototype.setGlobals = function setGlobals(globals) {
		// terminate all existing workers
		this._workers.forEach(function (worker) {
			worker.terminate();
		});

		// flush worker pool
		this._workers = [];

		// replace globals
		this._globals = globals;

		this._next();
	};

	WorkerManager.prototype._runOnWorker = function _runOnWorker(worker, args, func) {
		return new Promise(function (resolve, reject) {
			worker.run({
				id: ++WorkerManager.taskCount,
				arguments: args,
				function: func,
				resolve: resolve,
				reject: reject
			});
		});
	};

	WorkerManager.prototype.wrap = function wrap(func) {
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
	};

	WorkerManager.prototype.terminate = function terminate() {
		this._log('terminated');

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
	};

	WorkerManager.prototype._reissueTasksInTimedoutWorkers = function _reissueTasksInTimedoutWorkers() {
		var _this2 = this;

		if (new Date() - this._lastTaskTimeoutCheck < 5000) {
			return;
		}

		this._lastTaskTimeoutCheck = new Date();

		this._workers.forEach(function (worker) {
			worker.tasks.some(function (task) {
				if (new Date() - task.startTime >= _this2._taskTimeout) {
					worker.forceExit();
					return true;
				}
			});
		});
	};

	WorkerManager.prototype._flushIdleWorkers = function _flushIdleWorkers() {
		this._log('flushing idle workers');
		this._workers = this._workers.filter(function (worker) {
			if (worker.tasks.length === 0 && new Date() - worker.lastTaskTimestamp > this._idleTimeout) {
				worker.terminate();
				return false;
			} else {
				return true;
			}
		}, this);
	};

	WorkerManager.prototype._getWorker = function _getWorker() {
		var _this3 = this;

		var idleWorkers = this._workers.filter(function (worker) {
			return worker.tasks.length <= _this3._workerTaskConcurrency;
		}).sort(function (a, b) {
			return a.tasks.length - b.tasks.length;
		});

		if (idleWorkers.length) {
			return idleWorkers[0];
		} else if (this._workers.length < this._maxWorkers && this._workersInitializing.length === 0) {
			return this._createWorker();
		} else {
			return null;
		}
	};

	WorkerManager.prototype._createWorker = function _createWorker() {
		var workerId = ++this._totalWorkersCreated;

		var worker = new this._WorkerProxy({
			debug: this._debug,
			logger: this._logger,
			id: workerId,
			managerId: this.id,
			onTaskComplete: this._onWorkerTaskComplete,
			onExit: this._onWorkerExit
		});

		if (this._globalsInitializationFunction || this._globals) {
			this._log('running global initialization code');
			var globalsInitializationFunction = ('\n\t\t\t\tfunction (_globals) {\n\t\t\t\t\tglobals = (' + (this._globalsInitializationFunction || function (globals) {
				return globals;
			}).toString() + ')(_globals || {});\n\t\t\t\t}\n\t\t\t').trim();

			this._workersInitializing.push(worker);
			this._runOnWorker(worker, [this._globals || {}], globalsInitializationFunction).then(function () {
				this._workersInitializing = this._workersInitializing.filter(function (item) {
					return item != worker;
				});
				this._workers.push(worker);
			}.bind(this));
			return null;
		} else {
			this._workers.push(worker);
			return worker;
		}
	};

	return WorkerManager;
}();

WorkerManager.managerCount = 0;
WorkerManager.taskCount = 0;


module.exports = WorkerManager;