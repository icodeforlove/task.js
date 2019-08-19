'use strict';

var _require = require('worker_threads'),
    parentPort = _require.parentPort,
    workerData = _require.workerData;

var globals = {};

parentPort.on('message', function (message) {
	var args = Object.keys(message).filter(function (key) {
		return key.match(/^argument/);
	}).sort(function (a, b) {
		return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
	}).map(function (key) {
		return message[key];
	});

	try {
		var result = eval('(' + message.func + ')').apply(null, args);

		if (typeof Promise != 'undefined' && result instanceof Promise) {
			result.then(function (result) {
				parentPort.postMessage({ id: message.id, result: result });
			}).catch(function (error) {
				parentPort.postMessage({ id: message.id, error: error.stack });
			});
		} else {
			parentPort.postMessage({ id: message.id, result: result });
		}
	} catch (error) {
		parentPort.postMessage({ id: message.id, error: error.stack });
	}
});