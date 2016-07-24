class Worker {
	constructor ($config, WorkerProxy) {
		this.worker = new WorkerProxy();
		this.worker.addEventListener('message', this._onWorkerMessage.bind(this));
		this.tasks = [];
		this.lastTaskTimestamp = null;

		this._onTaskComplete = $config.onTaskComplete;
	}

	_generateTaskID () {
		let id = Math.random(),
			exists = false;

		this.tasks.some(function (task) {
			if (task.id === true) {
				exists = true;
				return true;
			}
		});

		return exists ? this._generateTaskID() : id;
	}

	_onWorkerMessage (message) {
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
				task.reject(new Error(`task.js: ${message.error}`));
			} else {
				task.resolve(message.result);
			}
			this._onTaskComplete(this);
			this.tasks.splice(taskIndex, 1);
		}
	}

	run ($options) {
		let id = this._generateTaskID();

		this.lastTaskTimestamp = new Date();

		this.tasks.push({
			id: id,
			resolve: $options.resolve,
			reject: $options.reject,
		});

		let message = {
			id: id,
			func: String($options.function)
		};

		// because of transferables (we want to keep this object flat)
		Object.keys($options.arguments).forEach(function (key, index) {
			message['argument' + index] = $options.arguments[index];
		});

		this.worker.postMessage(message, $options.transferables);
	}

	terminate () {
		this.tasks.forEach(task => task.reject('terminated'));
		this.tasks = [];
		this.worker.terminate();
	}
}

module.exports = Worker;