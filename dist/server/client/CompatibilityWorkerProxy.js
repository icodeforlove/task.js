'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CompatibilityWorkerProxy = function () {
	function CompatibilityWorkerProxy() {
		var _this = this;

		_classCallCheck(this, CompatibilityWorkerProxy);

		this._onMessage = function (event) {
			var message = event;

			var callbacks = _this._listeners.message;
			if (callbacks) {
				callbacks.forEach(function (callback) {
					return callback(message);
				});
			}
		};

		this._listeners = {};
	}

	_createClass(CompatibilityWorkerProxy, [{
		key: 'addEventListener',
		value: function addEventListener(event, callback) {
			this._listeners[event] = this._listeners[event] || [];
			this._listeners[event].push(callback);
		}
	}, {
		key: 'postMessage',
		value: function postMessage(message, options) {
			var _this2 = this;

			// toss it out of the event loop
			setTimeout(function () {
				var args = Object.keys(message).filter(function (key) {
					return key.match(/^argument/);
				}).sort(function (a, b) {
					return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
				}).map(function (key) {
					return message[key];
				});

				_this2._onMessage({ id: message.id, result: eval('(' + message.func + ')').apply(null, args) });
			}, 1);
		}
	}, {
		key: 'terminate',
		value: function terminate() {
			this._worker.terminate();
		}
	}]);

	return CompatibilityWorkerProxy;
}();

module.exports = CompatibilityWorkerProxy;