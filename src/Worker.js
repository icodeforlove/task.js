class Worker {
	constructor ($config, WorkerProxy) {
		this.id = $config.id;
		this.managerId = $config.managerId;
		this._debug = $config.debug;
		this.worker = new WorkerProxy({
			id: this.id,
			managerId: this.managerId,
			debug: this._debug
		});
		this.worker.addEventListener('message', this._onWorkerMessage);
		this.worker.addEventListener('exit', this._onWorkerExit);
		this.tasks = [];
		this.lastTaskTimestamp = null;
		this._debug = $config.debug;

		this._onTaskComplete = $config.onTaskComplete;
		this._onExit = $config.onExit;

		this._log('initialized');
	}

	_log (message) {
		if (this._debug) {
			console.log(`task.js:worker[mid(${this.managerId}) wid(${this.id})]: ${message}`);
		}
	}

	_onWorkerExit = () => {
		this._log('killed');
		this._onExit(this);
	}

	_onWorkerMessage = (message) => {
		let taskIndex = null;

		this.tasks.some(function (task, index) {
			if (message.id === task.id) {
				taskIndex = index;
				return true;
			}
		});

		if (taskIndex !== null) {
			var task = this.tasks[taskIndex];
			if (message.error) {
				this._log(`tid(${task.id}) has thrown an error ${message.error}`);
				if (task.callback) {
					task.callback(new Error(`task.js: ${message.error}`));
				} else {
					task.reject(new Error(`task.js: ${message.error}`));
				}
			} else {
				this._log(`tid(${task.id}) has completed`);
				if (task.callback) {
					task.callback(null, message.result);
				} else {
					task.resolve(message.result);
				}
			}
			this._onTaskComplete(this);
			this.tasks.splice(taskIndex, 1);
		}
	}

	run ($options) {
		this.lastTaskTimestamp = new Date();

		let task = {
			id: $options.id,
			resolve: $options.resolve,
			reject: $options.reject,
			callback: $options.callback,
			$options: $options
		};

		this.tasks.push(task);

		let message = {
			id: task.id,
			func: String($options.function)
		};

		// because of transferables (we want to keep this object flat)
		Object.keys($options.arguments).forEach(function (key, index) {
			message['argument' + index] = $options.arguments[index];
		});

		this._log(`sending tid(${task.id}) to worker`);

		this.worker.postMessage(message, $options.transferables);
	}

	_purgeTasks(reason) {
		this.tasks.forEach(task => {
			if (task.callback) {
				task.callback(reason);
			} else {
				task.reject(reason);
			}
		});
		this.tasks = [];
	}

	terminate () {
		this._purgeTasks();
		this.worker.terminate();
	}
}

module.exports = Worker;