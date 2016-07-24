import os from 'os';
import NodeWorkerProxy from './NodeWorkerProxy';
import WorkerManager from '../WorkerManager';

const defaults = {
	maxWorkers: os.cpus().length
};

// expose default instance directly
module.exports = new WorkerManager(defaults, NodeWorkerProxy);

// allow custom settings (task.js factory)
module.exports.defaults = function ($config, WorkerProxy) {
	let config = {};

	// clone defaults
	Object.keys(defaults).forEach(key => config[key] = defaults[key]);

	// apply user settings
	Object.keys($config).forEach(key => config[key] = $config[key]);

	return new WorkerManager(config, WorkerProxy || NodeWorkerProxy);
};