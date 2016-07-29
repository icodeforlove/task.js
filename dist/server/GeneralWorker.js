'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GeneralWorker = function () {
	function GeneralWorker($config) {
		var _this = this;

		_classCallCheck(this, GeneralWorker);

		this.handleWorkerExit = function () {
			_this._log('killed');
			_this._onExit(_this);
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
					_this._log('tid(' + task.id + ') has thrown an error ' + message.error);
					if (task.callback) {
						task.callback(new Error('task.js: ' + message.error));
					} else {
						task.reject(new Error('task.js: ' + message.error));
					}
				} else {
					_this._log('tid(' + task.id + ') has completed');
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

		this.tasks = [];
		this.lastTaskTimestamp = null;

		this._onTaskComplete = $config.onTaskComplete;
		this._onExit = $config.onExit;
	}

	GeneralWorker.prototype.run = function run($options) {
		this.lastTaskTimestamp = new Date();

		var task = {
			id: $options.id,
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

		this._log('sending tid(' + task.id + ') to worker');

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