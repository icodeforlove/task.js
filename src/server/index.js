const os = require('os');
const NodeWorker = require('./NodeWorker');
const NodeWorkerThread = require('./NodeWorkerThread');
const WorkerManager = require('../WorkerManager');
const generateTaskFactoryMethod = require('../generateTaskFactoryMethod');

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