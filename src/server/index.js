import os from 'os';
import NodeWorkerProxy from './NodeWorkerProxy';
import WorkerManager from '../WorkerManager';
import generateTaskFactoryMethod from '../generateTaskFactoryMethod';

const defaults = {
	maxWorkers: os.cpus().length
};

// expose default instance directly
module.exports = new WorkerManager(defaults, NodeWorkerProxy);

// allow custom settings (task.js factory)
module.exports.defaults = generateTaskFactoryMethod(defaults, NodeWorkerProxy, WorkerManager);