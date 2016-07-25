'use strict';

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _NodeWorkerProxy = require('./NodeWorkerProxy');

var _NodeWorkerProxy2 = _interopRequireDefault(_NodeWorkerProxy);

var _WorkerManager = require('../WorkerManager');

var _WorkerManager2 = _interopRequireDefault(_WorkerManager);

var _generateTaskFactoryMethod = require('../generateTaskFactoryMethod');

var _generateTaskFactoryMethod2 = _interopRequireDefault(_generateTaskFactoryMethod);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var defaults = {
	maxWorkers: _os2['default'].cpus().length
};

// expose default instance directly
module.exports = new _WorkerManager2['default'](defaults, _NodeWorkerProxy2['default']);

// allow custom settings (task.js factory)
module.exports.defaults = (0, _generateTaskFactoryMethod2['default'])(defaults, _NodeWorkerProxy2['default'], _WorkerManager2['default']);