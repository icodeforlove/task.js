import functionToObjectURL from './functionToObjectURL';
import GeneralWorker from '../GeneralWorker';

class WebWorker extends GeneralWorker {
	constructor ($config) {
		super(...arguments);

		this._worker = new Worker(functionToObjectURL(this.WORKER_SOURCE));
		this._worker.addEventListener('message', this._onMessage);

		this._log(`initialized`);
	}

	_log (message) {
		if (this._debug) {
			console.log(`task.js:worker[mid(${this.managerId}) wid(${this.id})]: ${message}`);
		}
	}

	WORKER_SOURCE = `function () {
		onmessage = function (event) {
			var message = event.data;

			var args = Object.keys(message).filter(function (key) {
				return key.match(/^argument/);
			}).sort(function (a, b) {
				return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
			}).map(function (key) {
				return message[key];
			});

			try {
				postMessage({id: message.id, result: eval('(' + message.func + ')').apply(null, args)});
			} catch (error) {
				postMessage({id: message.id, error: error.message});
			}
		}
	}`;

	_onMessage = (event) => {
		let message = event.data;
		this.handleWorkerMessage(message);
	}

	postMessage = (message, options) => {
		this._log(`sending tid(${message.id}) to worker process`);
		this._worker.postMessage(message, options);
	}

	terminate = () => {
		this._log(`terminated`);
		this._worker.terminate();
	}
}

module.exports = WebWorker;