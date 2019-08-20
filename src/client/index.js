import isModern from './isModern';
import WorkerManager from '../WorkerManager';
import generateTaskFactoryMethod from '../generateTaskFactoryMethod';
import CompatibilityWorker from './CompatibilityWorker';

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
// module.exports = class ServerWorkerManager extends WorkerManager {
// 	WorkerProxies = WorkerProxies;
// };
// console.log(module.exports);
// // expose default instance directly
// module.exports = new WorkerManager(defaults, {DefaultWorkerProxy: WorkerProxy});

// // allow custom settings (task.js factory)
// module.exports.defaults = generateTaskFactoryMethod(defaults, {DefaultWorkerProxy: WorkerProxy}, WorkerManager);