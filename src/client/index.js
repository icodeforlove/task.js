const isModern = require('./isModern');
const WorkerManager = require('../WorkerManager');
const generateTaskFactoryMethod = require('../generateTaskFactoryMethod');
const CompatibilityWorker = require('./CompatibilityWorker');

let WorkerProxies = {
	CompatibilityWorker
};

if (isModern()) {
	WorkerProxies.DefaultWorkerProxy = require('./WebWorker');
}

module.exports = class ServerWorkerManager extends WorkerManager {
	constructor ($config) {
		super($config, WorkerProxies);
	}
};