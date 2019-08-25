"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var GeneralWorker =
/*#__PURE__*/
function () {
  function GeneralWorker($config) {
    var _this = this;

    _classCallCheck(this, GeneralWorker);

    _defineProperty(this, "handleWorkerExit", function () {
      if (_this._debug) {
        _this._log({
          action: 'killed'
        });
      }

      _this._onExitHandler(_this);
    });

    _defineProperty(this, "forceExit", function () {
      _this._onExit();

      _this._worker.kill();
    });

    _defineProperty(this, "handleWorkerMessage", function (message) {
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
          if (_this._debug) {
            _this._log({
              taskId: task.id,
              action: 'task_error',
              message: "taskId(".concat(task.id, ") has thrown an error ").concat(message.error)
            });
          }

          task.reject(new Error("task.js: ".concat(message.error)));
        } else {
          if (_this._debug) {
            _this._log({
              taskId: task.id,
              action: 'task_completed',
              message: "taskId(".concat(task.id, ") has completed")
            });
          }

          task.resolve(message.result);
        }

        _this._onTaskComplete(_this);

        _this.tasks.splice(taskIndex, 1);
      }
    });

    this.id = $config.id;
    this.managerId = $config.managerId;
    this._debug = $config.debug;
    this._logger = $config.logger;
    this.tasks = [];
    this.lastTaskTimestamp = null;
    this._onTaskComplete = $config.onTaskComplete;
    this._onExitHandler = $config.onExit;
  }

  _createClass(GeneralWorker, [{
    key: "_log",
    value: function _log(data) {
      var event = {
        source: 'worker',
        managerId: this.managerId,
        workerId: this.id
      };
      Object.keys(data).forEach(function (key) {
        event[key] = data[key];
      });

      if (!event.message) {
        event.message = event.action;
      }

      this._logger(event);
    }
  }, {
    key: "run",
    value: function run($options) {
      this.lastTaskTimestamp = new Date();
      var task = {
        id: $options.id,
        startTime: new Date(),
        resolve: $options.resolve,
        reject: $options.reject,
        $options: $options
      };
      this.tasks.push(task);
      var message = {
        id: task.id,
        func: String($options["function"])
      }; // because of transferables (we want to keep this object flat)

      Object.keys($options.arguments).forEach(function (key, index) {
        message['argument' + index] = $options.arguments[index];
      });
      this.postMessage(message, $options.transferables);
    }
  }, {
    key: "_purgeTasks",
    value: function _purgeTasks(reason) {
      this.tasks.forEach(function (task) {
        task.reject(reason);
      });
      this.tasks = [];
    }
  }]);

  return GeneralWorker;
}();

module.exports = GeneralWorker;