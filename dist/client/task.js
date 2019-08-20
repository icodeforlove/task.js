/*! task.js - 0.0.31 - clientside */
var task =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _isModern = __webpack_require__(1);

	var _isModern2 = _interopRequireDefault(_isModern);

	var _WorkerManager2 = __webpack_require__(3);

	var _WorkerManager3 = _interopRequireDefault(_WorkerManager2);

	var _generateTaskFactoryMethod = __webpack_require__(5);

	var _generateTaskFactoryMethod2 = _interopRequireDefault(_generateTaskFactoryMethod);

	var _CompatibilityWorker = __webpack_require__(6);

	var _CompatibilityWorker2 = _interopRequireDefault(_CompatibilityWorker);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

	var WorkerProxies = {
		CompatibilityWorker: _CompatibilityWorker2.default
	};

	if ((0, _isModern2.default)()) {
		WorkerProxies.DefaultWorkerProxy = __webpack_require__(8);
	}

	// const defaults = {
	// 	maxWorkers: navigator.hardwareConcurrency
	// };

	//var WebWorker = isModern() ? require('./WebWorker') : require('./CompatibilityWorker');
	module.exports = function (_WorkerManager) {
		_inherits(ServerWorkerManager, _WorkerManager);

		function ServerWorkerManager($config) {
			_classCallCheck(this, ServerWorkerManager);

			return _possibleConstructorReturn(this, _WorkerManager.call(this, $config, WorkerProxies));
		}

		return ServerWorkerManager;
	}(_WorkerManager3.default);
	// module.exports = class ServerWorkerManager extends WorkerManager {
	// 	WorkerProxies = WorkerProxies;
	// };
	// console.log(module.exports);
	// // expose default instance directly
	// module.exports = new WorkerManager(defaults, {DefaultWorkerProxy: WorkerProxy});

	// // allow custom settings (task.js factory)
	// module.exports.defaults = generateTaskFactoryMethod(defaults, {DefaultWorkerProxy: WorkerProxy}, WorkerManager);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _functionToObjectURL = __webpack_require__(2);

	var _functionToObjectURL2 = _interopRequireDefault(_functionToObjectURL);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = function isModern() {
		if (typeof Worker != 'undefined' && (window.URL || window.webkitURL)) {
			try {
				var worker = new Worker((0, _functionToObjectURL2.default)(function () {}));
				worker.terminate();
				return true;
			} catch (error) {}
		}

		return false;
	};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function functionToObjectURL(func) {
		var blob,
		    stringFunc = func.toString();

		stringFunc = stringFunc.substring(stringFunc.indexOf('{') + 1, stringFunc.lastIndexOf('}'));

		try {
			blob = new Blob([stringFunc], { 'type': 'text/javascript' });
		} catch (error) {
			// Backwards-compatibility
			window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
			blob = new BlobBuilder();
			blob.append(stringFunc);
			blob = blob.getBlob();
		}

		return (window.URL || window.webkitURL).createObjectURL(blob);
	};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var WorkerManager = function () {
		function WorkerManager($config, WorkerProxies) {
			var _this = this;

			_classCallCheck(this, WorkerManager);

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
					__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"worker_threads\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
				} catch (error) {
					console.error('Your current version, or configuration of Node.js does not support worker_threads.');
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
			var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { useTransferables: false },
			    useTransferables = _ref.useTransferables;

			return function () {
				var args = Array.from(arguments),
				    callback = null,
				    transferables = null;

				if (useTransferables) {
					transferables = args.slice(-1)[0];
					if (!Array.isArray(transferables)) {
						throw new Error('Task expects to be passed a transferables array as its last argument.');
					}
					args = args.slice(0, -1);
				}

				if (typeof args[args.length - 1] === 'function') {
					// apparently splice is broken in ie8
					callback = args.slice(-1).pop();
					args = args.slice(0, -1);
				}

				return this.run({
					arguments: args,
					transferables: transferables,
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = function generateTaskFactoryMethod(defaults, WorkerProxy, WorkerManager) {
		return function ($config, WorkerProxyOverride) {
			var config = {};

			// clone defaults
			Object.keys(defaults).forEach(function (key) {
				return config[key] = defaults[key];
			});

			// apply user settings
			Object.keys($config).forEach(function (key) {
				return config[key] = $config[key];
			});

			return new WorkerManager(config, WorkerProxyOverride || WorkerProxy);
		};
	};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _GeneralWorker2 = __webpack_require__(7);

	var _GeneralWorker3 = _interopRequireDefault(_GeneralWorker2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

	var CompatibilityWorker = function (_GeneralWorker) {
		_inherits(CompatibilityWorker, _GeneralWorker);

		function CompatibilityWorker() {
			_classCallCheck(this, CompatibilityWorker);

			var _this = _possibleConstructorReturn(this, _GeneralWorker.apply(this, arguments));

			_this.postMessage = function (message, options) {
				// toss it out of the event loop
				_this._setTimeoutID = setTimeout(function () {
					var args = Object.keys(message).filter(function (key) {
						return key.match(/^argument/);
					}).sort(function (a, b) {
						return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
					}).map(function (key) {
						return message[key];
					});

					var functionBody = message.func.substring(message.func.indexOf('{') + 1, message.func.lastIndexOf('}')),
					    argNames = message.func.substring(message.func.indexOf('(') + 1, message.func.indexOf(')')).split(',');

					var func = new (Function.prototype.bind.apply(Function, [null].concat(_toConsumableArray(argNames), [functionBody])))();

					// we cant use eval
					try {
						var result = func.apply(undefined, _toConsumableArray(args));
						_this.handleWorkerMessage({ id: message.id, result: result });
					} catch (error) {
						_this.handleWorkerMessage({ id: message.id, 'error': error.stack });
					}
				}, 1);
			};

			_this.terminate = function () {
				clearTimeout(_this._setTimeoutID);
				_this._setTimeoutID = null;
			};

			_this._setTimeoutID = null;
			return _this;
		}

		return CompatibilityWorker;
	}(_GeneralWorker3.default);

	module.exports = CompatibilityWorker;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var GeneralWorker = function () {
		function GeneralWorker($config) {
			var _this = this;

			_classCallCheck(this, GeneralWorker);

			this.handleWorkerExit = function () {
				_this._log('killed');
				_this._onExitHandler(_this);
			};

			this.forceExit = function () {
				_this._onExit();
				_this._worker.kill();
			};

			this.handleWorkerMessage = function (message) {
				var taskIndex = null;

				_this.tasks.some(function (task, index) {
					if (message.id === task.id) {
						taskIndex = index;
						return true;
					}
				});

				if (taskIndex !== null) {
					var task = _this.tasks[taskIndex];
					if (message.error) {
						_this._log('taskId(' + task.id + ') has thrown an error ' + message.error);
						if (task.callback) {
							task.callback(new Error('task.js: ' + message.error));
						} else {
							task.reject(new Error('task.js: ' + message.error));
						}
					} else {
						_this._log('taskId(' + task.id + ') has completed');
						if (task.callback) {
							task.callback(null, message.result);
						} else {
							task.resolve(message.result);
						}
					}
					_this._onTaskComplete(_this);
					_this.tasks.splice(taskIndex, 1);
				}
			};

			this.id = $config.id;
			this.managerId = $config.managerId;
			this._debug = $config.debug;
			this._logger = $config.logger;

			this.tasks = [];
			this.lastTaskTimestamp = null;

			this._onTaskComplete = $config.onTaskComplete;
			this._onExitHandler = $config.onExit;
		}

		GeneralWorker.prototype._log = function _log(message) {
			if (this._debug) {
				this._logger('task.js:worker[managerId(' + this.managerId + ') workerId(' + this.id + ')]: ' + message);
			}
		};

		GeneralWorker.prototype.run = function run($options) {
			this.lastTaskTimestamp = new Date();

			var task = {
				id: $options.id,
				startTime: new Date(),
				resolve: $options.resolve,
				reject: $options.reject,
				callback: $options.callback,
				$options: $options
			};

			this.tasks.push(task);

			var message = {
				id: task.id,
				func: String($options.function)
			};

			// because of transferables (we want to keep this object flat)
			Object.keys($options.arguments).forEach(function (key, index) {
				message['argument' + index] = $options.arguments[index];
			});

			this.postMessage(message, $options.transferables);
		};

		GeneralWorker.prototype._purgeTasks = function _purgeTasks(reason) {
			this.tasks.forEach(function (task) {
				if (task.callback) {
					task.callback(reason);
				} else {
					task.reject(reason);
				}
			});
			this.tasks = [];
		};

		return GeneralWorker;
	}();

	module.exports = GeneralWorker;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _functionToObjectURL = __webpack_require__(2);

	var _functionToObjectURL2 = _interopRequireDefault(_functionToObjectURL);

	var _GeneralWorker2 = __webpack_require__(7);

	var _GeneralWorker3 = _interopRequireDefault(_GeneralWorker2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

	var WebWorker = function (_GeneralWorker) {
		_inherits(WebWorker, _GeneralWorker);

		function WebWorker($config) {
			_classCallCheck(this, WebWorker);

			var _this = _possibleConstructorReturn(this, _GeneralWorker.apply(this, arguments));

			_this.WORKER_SOURCE = 'function () {\n\t\tonmessage = function (event) {\n\t\t\tvar message = event.data;\n\n\t\t\tvar args = Object.keys(message).filter(function (key) {\n\t\t\t\treturn key.match(/^argument/);\n\t\t\t}).sort(function (a, b) {\n\t\t\t\treturn parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);\n\t\t\t}).map(function (key) {\n\t\t\t\treturn message[key];\n\t\t\t});\n\n\t\t\ttry {\n\t\t\t\tvar result = eval(\'(\' + message.func + \')\').apply(null, args);\n\n\t\t\t\tif (typeof Promise != \'undefined\' && result instanceof Promise) {\n\t\t\t\t\tresult.then(function (result) {\n\t\t\t\t\t\tpostMessage({id: message.id, result: result});\n\t\t\t\t\t}).catch(function (error) {\n\t\t\t\t\t\tpostMessage({id: message.id, error: error.stack});\n\t\t\t\t\t});\n\t\t\t\t} else {\n\t\t\t\t\tpostMessage({id: message.id, result: result});\n\t\t\t\t}\n\t\t\t} catch (error) {\n\t\t\t\tpostMessage({id: message.id, error: error.stack});\n\t\t\t}\n\t\t}\n\t}';

			_this._onMessage = function (event) {
				var message = event.data;
				_this.handleWorkerMessage(message);
			};

			_this.postMessage = function (message, options) {
				_this._log('sending taskId(' + message.id + ') to worker process');
				_this._worker.postMessage(message, options);
			};

			_this.terminate = function () {
				_this._log('terminated');
				_this._worker.terminate();
			};

			_this._worker = new Worker((0, _functionToObjectURL2.default)(_this.WORKER_SOURCE));
			_this._worker.addEventListener('message', _this._onMessage);

			_this._log('initialized');
			return _this;
		}

		return WebWorker;
	}(_GeneralWorker3.default);

	module.exports = WebWorker;

/***/ })
/******/ ]);