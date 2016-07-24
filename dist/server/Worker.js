'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Worker = function () {
	function Worker($config, WorkerProxy) {
		_classCallCheck(this, Worker);

		this.worker = new WorkerProxy();
		this.worker.addEventListener('message', this._onWorkerMessage.bind(this));
		this.tasks = [];
		this.lastTaskTimestamp = null;

		this._onTaskComplete = $config.onTaskComplete;
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
		key: '_onWorkerMessage',
		value: function _onWorkerMessage(message) {
			var taskIndex = null;

			this.tasks.some(function (task, index) {
				if (message.id === task.id) {
					taskIndex = index;
					return true;
				}
			});

			if (taskIndex !== null) {
				this.tasks[taskIndex].resolve(message.result);
				this._onTaskComplete(this);
				this.tasks.splice(taskIndex, 1);
			}
		}
	}, {
		key: 'run',
		value: function run($options) {
			var id = this._generateTaskID();

			this.lastTaskTimestamp = new Date();

			this.tasks.push({
				id: id,
				resolve: $options.resolve,
				reject: $options.reject
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
	}]);

	return Worker;
}();

module.exports = Worker;