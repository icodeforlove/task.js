import WebWorkerProxy from './WebWorkerProxy';
import CompatibilityWorkerProxy from './CompatibilityWorkerProxy';
import WorkerManager from '../WorkerManager';

const defaults = {
	maxWorkers: navigator.hardwareConcurrency
};

// expose default instance directly
module.exports = new WorkerManager(defaults, window.Worker ? WebWorkerProxy : CompatibilityWorkerProxy);

// allow custom settings (task.js factory)
module.exports.defaults = function ($config, WorkerProxy) {
	let config = {};

	// clone defaults
	Object.keys(defaults).forEach(key => config[key] = defaults[key]);

	// apply user settings
	Object.keys($config).forEach(key => config[key] = $config[key]);

	return new WorkerManager(config, WorkerProxy || WebWorkerProxy);
};