'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Worker = require('./Worker');

var _Worker2 = _interopRequireDefault(_Worker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkerManager = function () {
	function WorkerManager($config, WorkerProxy) {
		var _this = this;

		_classCallCheck(this, WorkerManager);

		this._next = function () {
			if (!_this._queue.length) return;

			var worker = _this._getWorker();

			if (!worker) {
				setTimeout(_this._next, 0);
				return;
			}

			var task = _this._queue.shift();

			worker.run(task);
		};

		this._onWorkerTaskComplete = function () {
			_this._next();
		};

		this._onWorkerExit = function (worker) {
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

		this._WorkerProxy = WorkerProxy;

		this._maxWorkers = $config.maxWorkers || 4;
		this._idleTimeout = $config.idleTimeout === false ? false : $config.idleTimeout || 10000;
		this._idleCheckInterval = $config.idleCheckInterval || 1000;

		this._workers = [];
		this._queue = [];
		this._onWorkerTaskComplete = this._onWorkerTaskComplete.bind(this);
		this._flushIdleWorkers = this._flushIdleWorkers.bind(this);
	}

	_createClass(WorkerManager, [{
		key: 'run',
		value: function run(task) {
			if (this._idleTimeout && typeof this._idleCheckIntervalID !== 'number') {
				this._idleCheckIntervalID = setInterval(this._flushIdleWorkers, this._idleCheckInterval);
			}

			if (!task.arguments || typeof task.arguments.length === 'undefined') {
				throw new Error('task.js: "arguments" is required property, and it must be an array/array-like');
			}

			if (!task['function'] && (typeof task['function'] !== 'function' || typeof task['function'] !== 'string')) {
				throw new Error('task.js: "function" is required property, and it must be a string or a function');
			}

			if (_typeof(task.arguments) === 'object') {
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
	}, {
		key: 'wrap',
		value: function wrap(func) {
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
					'function': func,
					callback: callback
				});
			}.bind(this);
		}
	}, {
		key: 'terminate',
		value: function terminate() {
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
	}, {
		key: '_flushIdleWorkers',
		value: function _flushIdleWorkers() {
			this._workers = this._workers.filter(function (worker) {
				if (worker.tasks.length === 0 && new Date() - worker.lastTaskTimestamp > this._idleTimeout) {
					worker.terminate();
					return false;
				} else {
					return true;
				}
			}, this);
		}
	}, {
		key: '_getWorker',
		value: function _getWorker() {
			var idleWorkers = this._workers.filter(function (worker) {
				return worker.tasks.length === 0;
			});

			if (idleWorkers.length) {
				return idleWorkers[0];
			} else if (this._workers.length < this._maxWorkers) {
				return this._createWorker();
			} else {
				return null;
			}
		}
	}, {
		key: '_createWorker',
		value: function _createWorker() {
			var worker = new _Worker2['default']({
				onTaskComplete: this._onWorkerTaskComplete,
				onExit: this._onWorkerExit
			}, this._WorkerProxy);

			this._workers.push(worker);

			return worker;
		}
	}]);

	return WorkerManager;
}();

module.exports = WorkerManager;