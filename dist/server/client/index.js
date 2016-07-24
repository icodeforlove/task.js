'use strict';

var _WebWorkerProxy = require('./WebWorkerProxy');

var _WebWorkerProxy2 = _interopRequireDefault(_WebWorkerProxy);

var _CompatibilityWorkerProxy = require('./CompatibilityWorkerProxy');

var _CompatibilityWorkerProxy2 = _interopRequireDefault(_CompatibilityWorkerProxy);

var _WorkerManager = require('../WorkerManager');

var _WorkerManager2 = _interopRequireDefault(_WorkerManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
	maxWorkers: navigator.hardwareConcurrency
};

// expose default instance directly
module.exports = new _WorkerManager2.default(defaults, window.Worker ? _WebWorkerProxy2.default : _CompatibilityWorkerProxy2.default);

// allow custom settings (task.js factory)
module.exports.defaults = function ($config, WorkerProxy) {
	var config = {};

	// clone defaults
	Object.keys(defaults).forEach(function (key) {
		return config[key] = defaults[key];
	});

	// apply user settings
	Object.keys($config).forEach(function (key) {
		return config[key] = $config[key];
	});

	return new _WorkerManager2.default(config, WorkerProxy || _WebWorkerProxy2.default);
};