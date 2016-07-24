'use strict';

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _NodeWorkerProxy = require('./NodeWorkerProxy');

var _NodeWorkerProxy2 = _interopRequireDefault(_NodeWorkerProxy);

var _WorkerManager = require('../WorkerManager');

var _WorkerManager2 = _interopRequireDefault(_WorkerManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var defaults = {
	maxWorkers: _os2['default'].cpus().length
};

// expose default instance directly
module.exports = new _WorkerManager2['default'](defaults, _NodeWorkerProxy2['default']);

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

	return new _WorkerManager2['default'](config, WorkerProxy || _NodeWorkerProxy2['default']);
};