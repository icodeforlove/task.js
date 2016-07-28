'use strict';

var globals = {};

function evalInContext(js, context) {
	//# Return the results of the in-line anonymous function we .call with the passed context
	return function () {
		return eval(js);
	}.call(context);
}

process.on('message', function (message) {
	var args = Object.keys(message).filter(function (key) {
		return key.match(/^argument/);
	}).sort(function (a, b) {
		return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
	}).map(function (key) {
		return message[key];
	});

	try {
		process.send({ id: message.id, result: eval('(' + message.func + ')').apply(null, args) });
	} catch (error) {
		process.send({ id: message.id, error: error.message });
	}
});