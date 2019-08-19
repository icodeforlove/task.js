import functionToObjectURL from './functionToObjectURL';
import GeneralWorker from '../GeneralWorker';

class WebWorker extends GeneralWorker {
	constructor ($config) {
		super(...arguments);

		this._worker = new Worker(functionToObjectURL(this.WORKER_SOURCE));
		this._worker.addEventListener('message', this._onMessage);

		this._log(`initialized`);
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
				var result = eval('(' + message.func + ')').apply(null, args);

				if (typeof Promise != 'undefined' && result instanceof Promise) {
					result.then(function (result) {
						postMessage({id: message.id, result: result});
					}).catch(function (error) {
						postMessage({id: message.id, error: error.stack});
					});
				} else {
					postMessage({id: message.id, result: result});
				}
			} catch (error) {
				postMessage({id: message.id, error: error.stack});
			}
		}
	}`;

	_onMessage = (event) => {
		let message = event.data;
		this.handleWorkerMessage(message);
	}

	postMessage = (message, options) => {
		this._log(`sending taskId(${message.id}) to worker process`);
		this._worker.postMessage(message, options);
	}

	terminate = () => {
		this._log(`terminated`);
		this._worker.terminate();
	}
}

module.exports = WebWorker;