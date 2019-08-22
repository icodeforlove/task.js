require('babel-polyfill');

window.Promise = require('bluebird');

const Task = require('../../src/client/index.js');

(function() {
	jasmine.getEnv().addReporter(new (function () {
		this.jasmineDone = async function(result) {
			window.JASMINE_FINISHED_STATUS = result.overallStatus;
		};
	}));
})();
jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;

// describe('Browser Compatibility Tests', require(`${__dirname}/../general.js`)(
// 	Task,
// 	Promise,
// 	{workerType: 'compatibility_worker'}
// ));

describe('Browser Web Worker Tests', require(`${__dirname}/../general.js`)(
	Task,
	Promise,
	{workerType: 'web_worker'}
));