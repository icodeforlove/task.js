'use strict';

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _Worker = require('../Worker.js');

var _Worker2 = _interopRequireDefault(_Worker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NodeWorkerProxy = function (_GeneralWorker) {
	_inherits(NodeWorkerProxy, _GeneralWorker);

	function NodeWorkerProxy($config) {
		_classCallCheck(this, NodeWorkerProxy);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NodeWorkerProxy).apply(this, arguments));

		_this._log = function (message) {
			if (_this._debug) {
				console.log('task.js:worker-proxy[mid(' + _this.managerId + ') wid(' + _this.id + ') pid(' + _this._worker.pid + ')]: ' + message);
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
			//this._listeners = {};
			_this._worker.kill();
		};

		$config = $config || {};

		//this._listeners = {};
		_this._worker = _child_process2['default'].fork(__dirname + '/NodeWorker.js');
		_this._worker.on('message', _this._onMessage);
		_this._worker.on('exit', _this._onExit);
		_this._worker.on('close', _this._onExit);
		_this._worker.on('disconnect', _this._onExit);
		_this._worker.on('error', _this._onExit);
		_this._alive = true;
		// this._debug = $config.debug;
		// this.id = $config.id;
		// this.managerId = $config.managerId;

		_this._log('initialized');
		return _this;
	}

	return NodeWorkerProxy;
}(_Worker2['default']);

module.exports = NodeWorkerProxy;