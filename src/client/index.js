import 'babel-polyfill';
import isModern from './isModern';
import WorkerManager from '../WorkerManager';
import generateTaskFactoryMethod from '../generateTaskFactoryMethod';

const defaults = {
	maxWorkers: navigator.hardwareConcurrency
};

var WorkerProxy = isModern() ? require('./WebWorker') : require('./CompatibilityWorker');

// expose default instance directly
module.exports = new WorkerManager(defaults, WorkerProxy);

// allow custom settings (task.js factory)
module.exports.defaults = generateTaskFactoryMethod(defaults, WorkerProxy, WorkerManager);