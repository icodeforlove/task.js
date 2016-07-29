'use strict';

var _isModern = require('./isModern');

var _isModern2 = _interopRequireDefault(_isModern);

var _WorkerManager = require('../WorkerManager');

var _WorkerManager2 = _interopRequireDefault(_WorkerManager);

var _generateTaskFactoryMethod = require('../generateTaskFactoryMethod');

var _generateTaskFactoryMethod2 = _interopRequireDefault(_generateTaskFactoryMethod);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var defaults = {
	maxWorkers: navigator.hardwareConcurrency
};

var WorkerProxy = (0, _isModern2['default'])() ? require('./WebWorker') : require('./CompatibilityWorker');

// expose default instance directly
module.exports = new _WorkerManager2['default'](defaults, WorkerProxy);

// allow custom settings (task.js factory)
module.exports.defaults = (0, _generateTaskFactoryMethod2['default'])(defaults, WorkerProxy, _WorkerManager2['default']);