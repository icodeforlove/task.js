'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cp = require('child_process');

var NodeWorkerProxy = function () {
	function NodeWorkerProxy() {
		var _this = this;

		_classCallCheck(this, NodeWorkerProxy);

		this._onMessage = function (message) {
			var callbacks = _this._listeners.message;
			if (callbacks) {
				callbacks.forEach(function (callback) {
					return callback(message);
				});
			}
		};

		this._listeners = {};
		this._worker = cp.fork(__dirname + '/NodeWorker.js');
		this._worker.on('message', this._onMessage);
	}

	_createClass(NodeWorkerProxy, [{
		key: 'addEventListener',
		value: function addEventListener(event, callback) {
			this._listeners[event] = this._listeners[event] || [];
			this._listeners[event].push(callback);
		}
	}, {
		key: 'postMessage',
		value: function postMessage(message) {
			this._worker.send(message);
		}
	}, {
		key: 'terminate',
		value: function terminate() {
			this._worker.kill();
		}
	}]);

	return NodeWorkerProxy;
}();

module.exports = NodeWorkerProxy;