'use strict';

var _isModern = require('./isModern');

var _isModern2 = _interopRequireDefault(_isModern);

var _WorkerManager2 = require('../WorkerManager');

var _WorkerManager3 = _interopRequireDefault(_WorkerManager2);

var _generateTaskFactoryMethod = require('../generateTaskFactoryMethod');

var _generateTaskFactoryMethod2 = _interopRequireDefault(_generateTaskFactoryMethod);

var _CompatibilityWorker = require('./CompatibilityWorker');

var _CompatibilityWorker2 = _interopRequireDefault(_CompatibilityWorker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var WorkerProxies = {
	CompatibilityWorker: _CompatibilityWorker2.default
};

if ((0, _isModern2.default)()) {
	WorkerProxies.DefaultWorkerProxy = require('./WebWorker');
}

// const defaults = {
// 	maxWorkers: navigator.hardwareConcurrency
// };

//var WebWorker = isModern() ? require('./WebWorker') : require('./CompatibilityWorker');
module.exports = function (_WorkerManager) {
	_inherits(ServerWorkerManager, _WorkerManager);

	function ServerWorkerManager($config) {
		_classCallCheck(this, ServerWorkerManager);

		return _possibleConstructorReturn(this, _WorkerManager.call(this, $config, WorkerProxies));
	}

	return ServerWorkerManager;
}(_WorkerManager3.default);
// module.exports = class ServerWorkerManager extends WorkerManager {
// 	WorkerProxies = WorkerProxies;
// };
// console.log(module.exports);
// // expose default instance directly
// module.exports = new WorkerManager(defaults, {DefaultWorkerProxy: WorkerProxy});

// // allow custom settings (task.js factory)
// module.exports.defaults = generateTaskFactoryMethod(defaults, {DefaultWorkerProxy: WorkerProxy}, WorkerManager);