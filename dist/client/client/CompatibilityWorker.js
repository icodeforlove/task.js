"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var GeneralWorker = require('../GeneralWorker');

var CompatibilityWorker =
/*#__PURE__*/
function (_GeneralWorker) {
  _inherits(CompatibilityWorker, _GeneralWorker);

  function CompatibilityWorker() {
    var _this;

    _classCallCheck(this, CompatibilityWorker);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(CompatibilityWorker).apply(this, arguments));

    _defineProperty(_assertThisInitialized(_this), "postMessage", function (message, options) {
      // toss it out of the event loop
      _this._setTimeoutID = setTimeout(function () {
        var args = Object.keys(message).filter(function (key) {
          return key.match(/^argument/);
        }).sort(function (a, b) {
          return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
        }).map(function (key) {
          return message[key];
        });
        var functionBody = message.func.substring(message.func.indexOf('{') + 1, message.func.lastIndexOf('}')),
            argNames = message.func.substring(message.func.indexOf('(') + 1, message.func.indexOf(')')).split(',');

        var func = _construct(Function, _toConsumableArray(argNames).concat([functionBody])); // we cant use eval


        try {
          var result = func.apply(void 0, _toConsumableArray(args));

          _this.handleWorkerMessage({
            id: message.id,
            result: result
          });
        } catch (error) {
          _this.handleWorkerMessage({
            id: message.id,
            'error': error.stack
          });
        }
      }, 1);
    });

    _defineProperty(_assertThisInitialized(_this), "terminate", function () {
      clearTimeout(_this._setTimeoutID);
      _this._setTimeoutID = null;
    });

    _this._setTimeoutID = null;
    return _this;
  }

  return CompatibilityWorker;
}(GeneralWorker);

module.exports = CompatibilityWorker;