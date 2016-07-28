'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Worker = function () {
	function Worker($config, WorkerProxy) {
		var _this = this;

		_classCallCheck(this, Worker);

		this._onWorkerExit = function () {
			_this._log('killed');
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
		this.worker = new WorkerProxy({
			id: this.id,
			managerId: this.managerId,
			debug: this._debug
		});
		this.worker.addEventListener('message', this._onWorkerMessage);
		this.worker.addEventListener('exit', this._onWorkerExit);
		this.tasks = [];
		this.lastTaskTimestamp = null;
		this._debug = $config.debug;

		this._onTaskComplete = $config.onTaskComplete;
		this._onExit = $config.onExit;

		this._log('initialized');
	}

	_createClass(Worker, [{
		key: '_log',
		value: function _log(message) {
			if (this._debug) {
				console.log('task.js:worker[mid(' + this.managerId + ') wid(' + this.id + ')]: ' + message);
			}
		}
	}, {
		key: 'run',
		value: function run($options) {
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
				func: String($options['function'])
			};

			// because of transferables (we want to keep this object flat)
			Object.keys($options.arguments).forEach(function (key, index) {
				message['argument' + index] = $options.arguments[index];
			});

			this._log('sending tid(' + task.id + ') to worker');

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