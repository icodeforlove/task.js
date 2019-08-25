"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Transferables =
/*#__PURE__*/
function () {
  function Transferables(transferables) {
    _classCallCheck(this, Transferables);

    this.transferables = transferables.map(function (transferable) {
      if (!(transferable instanceof ArrayBuffer) && transferable && transferable.buffer instanceof ArrayBuffer) {
        return transferable.buffer;
      } else if (transferable instanceof ArrayBuffer) {
        return transferable;
      } else {
        throw new Error('Task.js: invalid transferable argument (ensure its a buffer backed array, or a buffer)');
      }
    });
  }

  _createClass(Transferables, [{
    key: "toArray",
    value: function toArray() {
      return this.transferables;
    }
  }]);

  return Transferables;
}();

var WorkerManager =
/*#__PURE__*/
function () {
  function WorkerManager($config, WorkerProxies) {
    var _this = this;

    _classCallCheck(this, WorkerManager);

    _defineProperty(this, "_next", function () {
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

      if (_this._debug) {
        _this._log({
          action: 'send_task_to_worker',
          taskId: task.id,
          workerId: worker.id,
          message: "sending taskId(".concat(task.id, ") to workerId(").concat(worker.id, ")")
        });
      }

      worker.run(task);
    });

    _defineProperty(this, "_onWorkerTaskComplete", function () {
      _this._next();
    });

    _defineProperty(this, "_onWorkerExit", function (worker) {
      if (_this._debug) {
        _this._log({
          action: 'worker_died',
          workerId: worker.id,
          message: "worker died, reissuing tasks"
        });
      } // purge dead worker from pool


      _this._workers = _this._workers.filter(function (item) {
        return item != worker;
      }); // add work back to queue

      worker.tasks.forEach(function (task) {
        _this._queue.push(task.$options);
      }); // run tick

      _this._next();
    });

    $config = $config || {};
    this.id = ++WorkerManager.managerCount;
    this._workerType = $config.workerType;

    if (this._workerType === 'worker_threads') {
      try {
        require('worker_threads');
      } catch (error) {
        throw new Error('Your current version, or configuration of Node.js does not support worker_threads.');
      }

      this._WorkerProxy = WorkerProxies.NodeWorkerThread;
    } else {
      this._WorkerProxy = WorkerProxies.DefaultWorkerProxy;
    }

    this._logger = $config.logger || console.log;
    this._requires = $config.requires;
    this._workerTaskConcurrency = ($config.workerTaskConcurrency || 1) - 1;
    this._maxWorkers = $config.maxWorkers || 1;
    this._idleTimeout = $config.idleTimeout === false ? false : $config.idleTimeout;
    this._taskTimeout = $config.taskTimeout || 0;
    this._idleCheckInterval = 1000;
    this._warmStart = $config.warmStart || false;
    this._globals = $config.globals;
    this._globalsInitializationFunction = $config.initialize;
    this._debug = $config.debug;

    if (this._debug) {
      this._log({
        action: 'create_new_pool',
        message: "creating new pool : ".concat(JSON.stringify($config)),
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
      setTimeout(function () {
        if (_this._debug) {
          _this._log({
            action: 'warmstart',
            message: 'warm starting workers'
          });
        }

        for (var i = 0; i < _this._maxWorkers; i++) {
          _this._createWorker();
        }

        if (_this._debug) {
          _this._log({
            action: 'warmstart_completed',
            message: 'started workers'
          });
        }
      }, 0);
    }
  }

  _createClass(WorkerManager, [{
    key: "_log",
    value: function _log(data) {
      var event = {
        source: 'manager',
        managerId: this.id
      };
      Object.keys(data).forEach(function (key) {
        event[key] = data[key];
      });

      if (!event.message) {
        event.message = event.action;
      }

      this._logger(event, this);
    }
  }, {
    key: "getActiveWorkerCount",
    value: function getActiveWorkerCount() {
      return this._workersInitializing.length + this._workers.length;
    }
  }, {
    key: "_run",
    value: function _run(task) {
      if (this._idleTimeout && typeof this._idleCheckIntervalID !== 'number') {
        this._idleCheckIntervalID = setInterval(this._flushIdleWorkers, this._idleCheckInterval);
      }

      if (!task.arguments || typeof task.arguments.length === 'undefined') {
        throw new Error('task.js: "arguments" is required property, and it must be an array/array-like');
      }

      if (!task["function"] && (typeof task["function"] !== 'function' || typeof task["function"] !== 'string')) {
        throw new Error('task.js: "function" is required property, and it must be a string or a function');
      }

      if (_typeof(task.arguments) === 'object') {
        task.arguments = Array.prototype.slice.call(task.arguments);
      }

      task.id = ++WorkerManager.taskCount;

      if (this._debug) {
        this._log({
          action: 'add_to_queue',
          taskId: task.id,
          message: "added taskId(".concat(task.id, ") to the queue")
        });
      }

      return new Promise(function (resolve, reject) {
        task.resolve = resolve;
        task.reject = reject;

        this._queue.push(task);

        this._next();
      }.bind(this));
    }
  }, {
    key: "_runOnWorker",
    value: function _runOnWorker(worker, args, func) {
      return new Promise(function (resolve, reject) {
        worker.run({
          id: ++WorkerManager.taskCount,
          arguments: args,
          "function": func,
          resolve: resolve,
          reject: reject
        });
      });
    }
  }, {
    key: "run",
    value: function run(func) {
      var wrappedFunc = this.wrap(func);

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return wrappedFunc.apply(void 0, args);
    }
  }, {
    key: "wrap",
    value: function wrap(func) {
      return function () {
        var args = Array.from(arguments),
            transferables = null,
            lastArg = args.slice(-1)[0];

        if (lastArg instanceof Transferables) {
          transferables = lastArg.toArray();
          args = args.slice(0, -1);
        }

        return this._run({
          arguments: args,
          transferables: transferables,
          "function": func
        });
      }.bind(this);
    }
  }, {
    key: "terminate",
    value: function terminate() {
      if (this._debug) {
        this._log({
          action: 'terminated',
          message: 'terminated'
        });
      } // kill idle timeout (if it exists)


      if (this._idleTimeout && typeof this._idleCheckIntervalID == 'number') {
        clearInterval(this._idleCheckIntervalID);
        this._idleCheckIntervalID = null;
      } // terminate all existing workers


      this._workers.forEach(function (worker) {
        worker.terminate();
      }); // flush worker pool


      this._workers = [];
    }
  }, {
    key: "_reissueTasksInTimedoutWorkers",
    value: function _reissueTasksInTimedoutWorkers() {
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
    }
  }, {
    key: "_flushIdleWorkers",
    value: function _flushIdleWorkers() {
      if (this._debug) {
        this._log({
          action: 'flush_idle_workers',
          message: "flushing idle workers"
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
  }, {
    key: "_getWorker",
    value: function _getWorker() {
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
    }
  }, {
    key: "_createWorker",
    value: function _createWorker() {
      var workerId = ++this._totalWorkersCreated;
      var worker = new this._WorkerProxy({
        debug: this._debug,
        logger: this._logger,
        id: workerId,
        managerId: this.id,
        onTaskComplete: this._onWorkerTaskComplete,
        onExit: this._onWorkerExit
      });

      if (this._globalsInitializationFunction || this._globals || this._requires) {
        if (this._debug) {
          this._log({
            action: 'run_global_initialize',
            message: "running global initialization code"
          });
        }

        var requireCode;

        if (this._workerType === 'web_worker') {
          requireCode = "\n\t\t\t\tif (Object.keys(requires).length) {\n\t\t\t\t\timportScripts(...Object.values(requires));\n\n\t\t\t\t\tObject.keys(requires).forEach(key => {\n\t\t\t\t\t\tif (typeof self[key] === 'undefined') {\n\t\t\t\t\t\t\tthrow new Error('Task.js: require failed importing ' + key + ' (\"' + requires[key] + '\")');\n\t\t\t\t\t\t}\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t\t";
        } else {
          requireCode = "\n\t\t\t\tObject.keys(requires).forEach(key => {\n\t\t\t\t\tglobal[key] = require(requires[key]);\n\t\t\t\t});\n\t\t\t\t";
        }

        var globalsInitializationFunction = "function (_globals) {\n\t\t\t\tlet requires = ".concat(JSON.stringify(this._requires || {}), ";\n\n\t\t\t\t").concat(requireCode, "\n\n\t\t\t\tif (typeof _globals != 'undefined') {\n\t\t\t\t\tObject.keys(_globals).forEach(key => {\n\t\t\t\t\t\tglobal[key] = _globals[key];\n\t\t\t\t\t});\n\t\t\t\t}\n\n\t\t\t\t(").concat((this._globalsInitializationFunction || function () {}).toString(), ")();\n\t\t\t}").trim();

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
    }
  }], [{
    key: "transferables",
    value: function transferables() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return new Transferables(args);
    }
  }]);

  return WorkerManager;
}();

_defineProperty(WorkerManager, "managerCount", 0);

_defineProperty(WorkerManager, "taskCount", 0);

module.exports = WorkerManager;