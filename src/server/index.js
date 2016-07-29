import os from 'os';
import NodeWorker from './NodeWorker';
import WorkerManager from '../WorkerManager';
import generateTaskFactoryMethod from '../generateTaskFactoryMethod';

const defaults = {
	maxWorkers: os.cpus().length
};

// expose default instance directly
module.exports = new WorkerManager(defaults, NodeWorker);

// allow custom settings (task.js factory)
module.exports.defaults = generateTaskFactoryMethod(defaults, NodeWorker, WorkerManager);