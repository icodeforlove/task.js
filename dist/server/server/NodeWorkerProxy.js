'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cp = require('child_process');

var NodeWorkerProxy = function () {
	function NodeWorkerProxy($config) {
		var _this = this;

		_classCallCheck(this, NodeWorkerProxy);

		this._onExit = function () {
			if (!_this._alive) {
				return;
			}

			_this._log('killed');

			_this._alive = false;

			var callbacks = _this._listeners.exit;
			if (callbacks) {
				callbacks.forEach(function (callback) {
					return callback();
				});
			}
		};

		this._onMessage = function (message) {
			var callbacks = _this._listeners.message;
			if (callbacks) {
				_this._log('recieved tid(' + message.id + ') completion event');
				callbacks.forEach(function (callback) {
					return callback(message);
				});
			}
		};

		$config = $config || {};

		this._listeners = {};
		this._worker = cp.fork(__dirname + '/NodeWorker.js');
		this._worker.on('message', this._onMessage);
		this._worker.on('exit', this._onExit);
		this._worker.on('close', this._onExit);
		this._worker.on('disconnect', this._onExit);
		this._worker.on('error', this._onExit);
		this._alive = true;
		this._debug = $config.debug;
		this.id = $config.id;
		this.managerId = $config.managerId;

		this._log('initialized');
	}

	_createClass(NodeWorkerProxy, [{
		key: '_log',
		value: function _log(message) {
			if (this._debug) {
				console.log('task.js:worker-proxy[mid(' + this.managerId + ') wid(' + this.id + ') pid(' + this._worker.pid + ')]: ' + message);
			}
		}
	}, {
		key: 'addEventListener',
		value: function addEventListener(event, callback) {
			this._listeners[event] = this._listeners[event] || [];
			this._listeners[event].push(callback);
		}
	}, {
		key: 'postMessage',
		value: function postMessage(message) {
			this._log('sending tid(' + message.id + ') to worker process');
			this._worker.send(message);
		}
	}, {
		key: 'terminate',
		value: function terminate() {
			this._log('terminated');
			this._listeners = {};
			this._worker.kill();
		}
	}]);

	return NodeWorkerProxy;
}();

module.exports = NodeWorkerProxy;