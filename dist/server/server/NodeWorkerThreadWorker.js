'use strict';

var _worker_threads = require('worker_threads');

var globals = {};

_worker_threads.parentPort.on('message', function (message) {
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
				// process.send({id: message.id, result: result});
				_worker_threads.parentPort.postMessage({ id: message.id, result: result });
			}).catch(function (error) {
				//process.send({id: message.id, error: error.stack});
				_worker_threads.parentPort.postMessage({ id: message.id, error: error.stack });
			});
		} else {
			//process.send({id: message.id, result: result});
			_worker_threads.parentPort.postMessage({ id: message.id, result: result });
		}
	} catch (error) {
		//process.send({id: message.id, error: error.stack});
		_worker_threads.parentPort.postMessage({ id: message.id, error: error.stack });
	}
});

// parentPort.postMessage({online: 1});

// // When a message from the parent thread is received, send it back:
// parentPort.on('message', (message) => {
// 	setTimeout(() => {
// 		parentPort.postMessage({message: 'pong'});
// 	}, 10);
// });