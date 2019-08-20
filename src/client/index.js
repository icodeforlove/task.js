const isModern = require('./isModern');
const WorkerManager = require('../WorkerManager');
const generateTaskFactoryMethod = require('../generateTaskFactoryMethod');
const CompatibilityWorker = require('./CompatibilityWorker');

// console.log(isModern);
let WorkerProxies = {
	CompatibilityWorker
};

if (isModern()) {
	WorkerProxies.DefaultWorkerProxy = require('./WebWorker');
}

// const defaults = {
// 	maxWorkers: navigator.hardwareConcurrency
// };

//var WebWorker = isModern() ? require('./WebWorker') : require('./CompatibilityWorker');
module.exports = class ServerWorkerManager extends WorkerManager {
	constructor ($config) {
		super($config, WorkerProxies);
	}
};