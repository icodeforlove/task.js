'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebWorkerProxy = function () {
	function WebWorkerProxy() {
		var _this = this;

		_classCallCheck(this, WebWorkerProxy);

		this.WORKER_SOURCE = 'function () {\n\t\tonmessage = function (event) {\n\t\t\tvar message = event.data;\n\n\t\t\tvar args = Object.keys(message).filter(function (key) {\n\t\t\t\treturn key.match(/^argument/);\n\t\t\t}).sort(function (a, b) {\n\t\t\t\treturn parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);\n\t\t\t}).map(function (key) {\n\t\t\t\treturn message[key];\n\t\t\t});\n\n\t\t\tpostMessage({id: message.id, result: eval(\'(\' + message.func + \')\').apply(null, args)});\n\t\t}\n\t}';

		this._onMessage = function (event) {
			var message = event.data;

			var callbacks = _this._listeners.message;
			if (callbacks) {
				callbacks.forEach(function (callback) {
					return callback(message);
				});
			}
		};

		this._listeners = {};
		this._worker = new Worker(this._functionToObjectURL(this.WORKER_SOURCE));
		this._worker.addEventListener('message', this._onMessage);
	}

	_createClass(WebWorkerProxy, [{
		key: '_functionToObjectURL',
		value: function _functionToObjectURL(func) {
			var blob = void 0,
			    stringFunc = func.toString();

			stringFunc = stringFunc.substring(stringFunc.indexOf('{') + 1, stringFunc.lastIndexOf('}'));

			try {
				blob = new Blob([stringFunc], { 'type': 'text/javascript' });
			} catch (error) {
				// Backwards-compatibility
				window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
				blob = new BlobBuilder();
				blob.append(stringFunc);
				blob = blob.getBlob();
			}

			return (window.URL || window.webkitURL).createObjectURL(blob);
		}
	}, {
		key: 'addEventListener',
		value: function addEventListener(event, callback) {
			this._listeners[event] = this._listeners[event] || [];
			this._listeners[event].push(callback);
		}
	}, {
		key: 'postMessage',
		value: function postMessage(message, options) {
			this._worker.postMessage(message, options);
		}
	}, {
		key: 'terminate',
		value: function terminate() {
			this._worker.terminate();
		}
	}]);

	return WebWorkerProxy;
}();

module.exports = WebWorkerProxy;