import os from 'os';
import NodeWorker from './NodeWorker';
import NodeWorkerThread from './NodeWorkerThread';
import WorkerManager from '../WorkerManager';
import generateTaskFactoryMethod from '../generateTaskFactoryMethod';

const defaults = {
	maxWorkers: os.cpus().length
};

module.exports = class ServerWorkerManager extends WorkerManager {
	constructor ($config) {
		super($config, {DefaultWorkerProxy: NodeWorker, NodeWorkerThread});
	}
};
//console.log(module.exports);
// // expose default instance directly
// module.exports = new WorkerManager(defaults, {DefaultWorkerProxy: NodeWorker, NodeWorkerThread});

// // allow custom settings (task.js factory)
// module.exports.defaults = generateTaskFactoryMethod(defaults, {DefaultWorkerProxy: NodeWorker, NodeWorkerThread}, WorkerManager);