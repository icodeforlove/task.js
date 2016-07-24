'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
		this._setTimeoutID = null;
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
			this._setTimeoutID = setTimeout(function () {
				var args = Object.keys(message).filter(function (key) {
					return key.match(/^argument/);
				}).sort(function (a, b) {
					return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
				}).map(function (key) {
					return message[key];
				});

				var functionBody = message.func.substring(message.func.indexOf('{') + 1, message.func.lastIndexOf('}')),
				    argNames = message.func.substring(message.func.indexOf('(') + 1, message.func.indexOf(')')).split(',');

				// we cant use eval
				var result = new (Function.prototype.bind.apply(Function, [null].concat(_toConsumableArray(argNames), [functionBody])))().apply(undefined, _toConsumableArray(args));

				_this2._onMessage({ id: message.id, result: result });
			}, 1);
		}
	}, {
		key: 'terminate',
		value: function terminate() {
			clearTimeout(this._setTimeoutID);
			this._setTimeoutID = null;
		}
	}]);

	return CompatibilityWorkerProxy;
}();

module.exports = CompatibilityWorkerProxy;