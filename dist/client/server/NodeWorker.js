"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var cp = require('child_process');

var GeneralWorker = require('../GeneralWorker');

var NodeWorker =
/*#__PURE__*/
function (_GeneralWorker) {
  _inherits(NodeWorker, _GeneralWorker);

  function NodeWorker($config) {
    var _this;

    _classCallCheck(this, NodeWorker);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(NodeWorker).apply(this, arguments));

    _defineProperty(_assertThisInitialized(_this), "_log", function (message) {
      if (_this._debug) {
        _this._logger("task.js:worker[managerId(".concat(_this.managerId, ") workerId(").concat(_this.id, ") processId(").concat(_this._worker.pid, ")]: ").concat(message));
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_onExit", function () {
      if (!_this._alive) {
        return;
      }

      _this._log("killed");

      _this._alive = false;

      _this.handleWorkerExit();
    });

    _defineProperty(_assertThisInitialized(_this), "_onMessage", function (message) {
      _this.handleWorkerMessage(message);
    });

    _defineProperty(_assertThisInitialized(_this), "postMessage", function (message) {
      _this._log("sending taskId(".concat(message.id, ") to worker process"));

      _this._worker.send(message);
    });

    _defineProperty(_assertThisInitialized(_this), "terminate", function () {
      _this._log("terminated");

      _this._worker.kill();
    });

    $config = $config || {};
    _this._worker = cp.fork("".concat(__dirname, "/EvalWorker.js"));

    _this._worker.on('message', _this._onMessage);

    _this._worker.on('exit', _this._onExit);

    _this._worker.on('close', _this._onExit);

    _this._worker.on('disconnect', _this._onExit);

    _this._worker.on('error', _this._onExit);

    _this._alive = true;

    _this._log("initialized");

    return _this;
  }

  return NodeWorker;
}(GeneralWorker);

module.exports = NodeWorker;