'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _functionToObjectURL = require('./functionToObjectURL');

var _functionToObjectURL2 = _interopRequireDefault(_functionToObjectURL);

var _GeneralWorker2 = require('../GeneralWorker');

var _GeneralWorker3 = _interopRequireDefault(_GeneralWorker2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebWorker = function (_GeneralWorker) {
	_inherits(WebWorker, _GeneralWorker);

	function WebWorker($config) {
		_classCallCheck(this, WebWorker);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebWorker).apply(this, arguments));

		_this.WORKER_SOURCE = 'function () {\n\t\tonmessage = function (event) {\n\t\t\tvar message = event.data;\n\n\t\t\tvar args = Object.keys(message).filter(function (key) {\n\t\t\t\treturn key.match(/^argument/);\n\t\t\t}).sort(function (a, b) {\n\t\t\t\treturn parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);\n\t\t\t}).map(function (key) {\n\t\t\t\treturn message[key];\n\t\t\t});\n\n\t\t\ttry {\n\t\t\t\tpostMessage({id: message.id, result: eval(\'(\' + message.func + \')\').apply(null, args)});\n\t\t\t} catch (error) {\n\t\t\t\tpostMessage({id: message.id, error: error.message});\n\t\t\t}\n\t\t}\n\t}';

		_this._onMessage = function (event) {
			var message = event.data;
			_this.handleWorkerMessage(message);
		};

		_this.postMessage = function (message, options) {
			_this._log('sending tid(' + message.id + ') to worker process');
			_this._worker.postMessage(message, options);
		};

		_this.terminate = function () {
			_this._log('terminated');
			_this._worker.terminate();
		};

		_this._worker = new Worker((0, _functionToObjectURL2['default'])(_this.WORKER_SOURCE));
		_this._worker.addEventListener('message', _this._onMessage);

		_this._log('initialized');
		return _this;
	}

	_createClass(WebWorker, [{
		key: '_log',
		value: function _log(message) {
			if (this._debug) {
				console.log('task.js:worker-proxy[mid(' + this.managerId + ') wid(' + this.id + ')]: ' + message);
			}
		}
	}]);

	return WebWorker;
}(_GeneralWorker3['default']);

module.exports = WebWorker;