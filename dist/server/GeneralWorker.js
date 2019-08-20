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
					task.reject(new Error('task.js: ' + message.error));
				} else {
					_this._log('taskId(' + task.id + ') has completed');
					task.resolve(message.result);
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
			task.reject(reason);
		});
		this.tasks = [];
	};

	return GeneralWorker;
}();

module.exports = GeneralWorker;