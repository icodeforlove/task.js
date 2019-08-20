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

describe('General Tests', require(`${__dirname}/../general.js`)(
	Task,
	Promise,
	{workerType: 'compatibility_worker'}
));