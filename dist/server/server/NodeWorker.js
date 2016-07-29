'use strict';

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _GeneralWorker2 = require('../GeneralWorker');

var _GeneralWorker3 = _interopRequireDefault(_GeneralWorker2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var NodeWorker = function (_GeneralWorker) {
	_inherits(NodeWorker, _GeneralWorker);

	function NodeWorker($config) {
		_classCallCheck(this, NodeWorker);

		var _this = _possibleConstructorReturn(this, _GeneralWorker.apply(this, arguments));

		_this._log = function (message) {
			if (_this._debug) {
				_this._logger('task.js:worker[mid(' + _this.managerId + ') wid(' + _this.id + ') pid(' + _this._worker.pid + ')]: ' + message);
			}
		};

		_this._onExit = function () {
			if (!_this._alive) {
				return;
			}

			_this._log('killed');

			_this._alive = false;

			_this.handleWorkerExit();
		};

		_this._onMessage = function (message) {
			_this.handleWorkerMessage(message);
		};

		_this.postMessage = function (message) {
			_this._log('sending tid(' + message.id + ') to worker process');
			_this._worker.send(message);
		};

		_this.terminate = function () {
			_this._log('terminated');
			_this._worker.kill();
		};

		$config = $config || {};

		_this._worker = _child_process2.default.fork(__dirname + '/EvalWorker.js');
		_this._worker.on('message', _this._onMessage);
		_this._worker.on('exit', _this._onExit);
		_this._worker.on('close', _this._onExit);
		_this._worker.on('disconnect', _this._onExit);
		_this._worker.on('error', _this._onExit);
		_this._alive = true;

		_this._log('initialized');
		return _this;
	}

	return NodeWorker;
}(_GeneralWorker3.default);

module.exports = NodeWorker;