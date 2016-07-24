import WorkerManager from '../WorkerManager';

const defaults = {
	maxWorkers: navigator.hardwareConcurrency
};

var WorkerProxy;
if (typeof Worker != 'undefined' && (window.URL || window.webkitURL)) {
	WorkerProxy = require('./WebWorkerProxy');
} else {
	WorkerProxy = require('./CompatibilityWorkerProxy');
}

// expose default instance directly
module.exports = new WorkerManager(defaults, WorkerProxy);

// allow custom settings (task.js factory)
module.exports.defaults = function ($config, WorkerProxyOverride) {
	let config = {};

	// clone defaults
	Object.keys(defaults).forEach(key => config[key] = defaults[key]);

	// apply user settings
	Object.keys($config).forEach(key => config[key] = $config[key]);

	return new WorkerManager(config, WorkerProxyOverride || WorkerProxy);
};