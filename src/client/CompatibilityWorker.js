const GeneralWorker = require('../GeneralWorker');

class CompatibilityWorker extends GeneralWorker {
	constructor () {
		super(...arguments);

		this._setTimeoutID = null;
	}

	postMessage = (message, options) => {
		// toss it out of the event loop
		this._setTimeoutID = setTimeout(() => {
			let args = Object.keys(message).filter(function (key) {
				return key.match(/^argument/);
			}).sort(function (a, b) {
				return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
			}).map(function (key) {
				return message[key];
			});

			let functionBody = message.func.substring(message.func.indexOf('{') + 1, message.func.lastIndexOf('}')),
				argNames = message.func.substring(message.func.indexOf('(') + 1, message.func.indexOf(')')).split(',');

			let func = (new Function(...argNames, functionBody));

			// we cant use eval
			try {
				let result = func(...args);
				this.handleWorkerMessage({id: message.id, result: result});
			} catch (error) {
				this.handleWorkerMessage({id: message.id, 'error': error.stack});
			}
		}, 1);
	}

	terminate = () => {
		clearTimeout(this._setTimeoutID);
		this._setTimeoutID = null;
	}
}

module.exports = CompatibilityWorker;