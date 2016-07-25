'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Worker = function () {
	function Worker($config, WorkerProxy) {
		var _this = this;

		_classCallCheck(this, Worker);

		this._onWorkerExit = function () {
			// something went wrong, and the worker died!
			_this._onExit(_this);
		};

		this._onWorkerMessage = function (message) {
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
					if (task.callback) {
						task.callback(new Error('task.js: ' + message.error));
					} else {
						task.reject(new Error('task.js: ' + message.error));
					}
				} else {
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

		this.worker = new WorkerProxy();
		this.worker.addEventListener('message', this._onWorkerMessage);
		this.worker.addEventListener('exit', this._onWorkerExit);
		this.tasks = [];
		this.lastTaskTimestamp = null;

		this._onTaskComplete = $config.onTaskComplete;
		this._onExit = $config.onExit;
	}

	_createClass(Worker, [{
		key: '_generateTaskID',
		value: function _generateTaskID() {
			var id = Math.random(),
			    exists = false;

			this.tasks.some(function (task) {
				if (task.id === true) {
					exists = true;
					return true;
				}
			});

			return exists ? this._generateTaskID() : id;
		}
	}, {
		key: 'run',
		value: function run($options) {
			var id = this._generateTaskID();

			this.lastTaskTimestamp = new Date();

			this.tasks.push({
				id: id,
				resolve: $options.resolve,
				reject: $options.reject,
				callback: $options.callback,
				$options: $options
			});

			var message = {
				id: id,
				func: String($options['function'])
			};

			// because of transferables (we want to keep this object flat)
			Object.keys($options.arguments).forEach(function (key, index) {
				message['argument' + index] = $options.arguments[index];
			});

			this.worker.postMessage(message, $options.transferables);
		}
	}, {
		key: '_purgeTasks',
		value: function _purgeTasks(reason) {
			this.tasks.forEach(function (task) {
				if (task.callback) {
					task.callback(reason);
				} else {
					task.reject(reason);
				}
			});
			this.tasks = [];
		}
	}, {
		key: 'terminate',
		value: function terminate() {
			this._purgeTasks();
			this.worker.terminate();
		}
	}]);

	return Worker;
}();

module.exports = Worker;