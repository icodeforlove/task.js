"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var os = require('os');

var NodeWorker = require('./NodeWorker');

var NodeWorkerThread = require('./NodeWorkerThread');

var WorkerManager = require('../WorkerManager');

var generateTaskFactoryMethod = require('../generateTaskFactoryMethod');

var defaults = {
  maxWorkers: os.cpus().length
};

module.exports =
/*#__PURE__*/
function (_WorkerManager) {
  _inherits(ServerWorkerManager, _WorkerManager);

  function ServerWorkerManager() {
    var $config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ServerWorkerManager);

    var config = {
      workerType: 'fork_worker'
    };
    Object.keys($config).forEach(function (key) {
      return config[key] = $config[key];
    });
    return _possibleConstructorReturn(this, _getPrototypeOf(ServerWorkerManager).call(this, config, {
      DefaultWorkerProxy: NodeWorker,
      NodeWorkerThread: NodeWorkerThread
    }));
  }

  return ServerWorkerManager;
}(WorkerManager);