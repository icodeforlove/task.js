"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var functionToObjectURL = require('./functionToObjectURL');

var GeneralWorker = require('../GeneralWorker');

var WebWorker =
/*#__PURE__*/
function (_GeneralWorker) {
  _inherits(WebWorker, _GeneralWorker);

  function WebWorker($config) {
    var _this;

    _classCallCheck(this, WebWorker);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(WebWorker).apply(this, arguments));

    _defineProperty(_assertThisInitialized(_this), "WORKER_SOURCE", "function () {\n\t\tlet global = new Proxy(\n\t\t  {},\n\t\t  {\n\t\t    set: (obj, prop, newval) => (self[prop] = newval)\n\t\t  }\n\t\t);\n\n\t\tonmessage = function (event) {\n\t\t\tvar message = event.data;\n\n\t\t\tvar args = Object.keys(message).filter(function (key) {\n\t\t\t\treturn key.match(/^argument/);\n\t\t\t}).sort(function (a, b) {\n\t\t\t\treturn parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);\n\t\t\t}).map(function (key) {\n\t\t\t\treturn message[key];\n\t\t\t});\n\n\t\t\ttry {\n\t\t\t\tvar result = eval('(' + message.func + ')').apply(null, args);\n\n\t\t\t\tif (result && result.then && result.catch && result.finally) {\n\t\t\t\t\tresult.then(result => {\n\t\t\t\t\t\tself.postMessage({id: message.id, result: result});\n\t\t\t\t\t}).catch(error => {\n\t\t\t\t\t\tself.postMessage({id: message.id, error: error.stack});\n\t\t\t\t\t});\n\t\t\t\t} else {\n\t\t\t\t\tself.postMessage({id: message.id, result: result});\n\t\t\t\t}\n\t\t\t} catch (error) {\n\t\t\t\tself.postMessage({id: message.id, error: error.stack});\n\t\t\t}\n\t\t}\n\t}");

    _defineProperty(_assertThisInitialized(_this), "_onMessage", function (event) {
      var message = event.data;

      _this.handleWorkerMessage(message);
    });

    _defineProperty(_assertThisInitialized(_this), "postMessage", function (message, transferables) {
      if (_this._debug) {
        _this._log({
          taskId: message.id,
          action: 'send_task_to_actual_worker',
          message: "sending taskId(".concat(message.id, ") to worker process")
        });
      }

      _this._worker.postMessage(message, transferables);
    });

    _defineProperty(_assertThisInitialized(_this), "terminate", function () {
      if (_this._debug) {
        _this._log({
          message: 'terminated'
        });
      }

      _this._worker.terminate();
    });

    _this._worker = new Worker(functionToObjectURL(_this.WORKER_SOURCE));

    _this._worker.addEventListener('message', _this._onMessage);

    if (_this._debug) {
      _this._log({
        action: 'initialized'
      });
    }

    return _this;
  }

  return WebWorker;
}(GeneralWorker);

module.exports = WebWorker;