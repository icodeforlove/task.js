var Task = require(`${__dirname}/../../dist/server/server`),
	Promise = require('bluebird');

describe('Node Fork Tests', require(`${__dirname}/../general.js`)(
	Task,
	Promise,
	{workerType: 'fork_worker'}
));

describe('Worker Thread Tests', require(`${__dirname}/../general.js`)(
	Task,
	Promise,
	{workerType: 'worker_threads'}
));