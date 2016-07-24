'use strict';

var _isModern = require('./isModern');

var _isModern2 = _interopRequireDefault(_isModern);

var _WorkerManager = require('../WorkerManager');

var _WorkerManager2 = _interopRequireDefault(_WorkerManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var defaults = {
	maxWorkers: navigator.hardwareConcurrency
};

var WorkerProxy = (0, _isModern2['default'])() ? require('./WebWorkerProxy') : require('./CompatibilityWorkerProxy');

// expose default instance directly
module.exports = new _WorkerManager2['default'](defaults, WorkerProxy);

// allow custom settings (task.js factory)
module.exports.defaults = function ($config, WorkerProxyOverride) {
	var config = {};

	// clone defaults
	Object.keys(defaults).forEach(function (key) {
		return config[key] = defaults[key];
	});

	// apply user settings
	Object.keys($config).forEach(function (key) {
		return config[key] = $config[key];
	});

	return new _WorkerManager2['default'](config, WorkerProxyOverride || WorkerProxy);
};