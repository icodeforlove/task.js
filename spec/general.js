module.exports = function (task, Promise, CompatibilityWorkerProxy) {
	return function() {
		it('can use custom defaults', function() {
			let defaults = {
				maxWorkers: 3,
				idleTimeout: 5000,
				idleCheckInterval: 11000
			};

			let customTask = task.defaults(defaults);

			expect(customTask._maxWorkers).toBe(defaults.maxWorkers);
			expect(customTask._idleTimeout).toBe(defaults.idleTimeout);
			expect(customTask._idleCheckInterval).toBe(defaults.idleCheckInterval);
		});

		it('can run a single task', function(done) {
			task.run({
				arguments: [2],
				function: function (number) {
					return Math.pow(number, 2);
				}
			}).then(function (squaredNumber) {
				expect(squaredNumber).toBe(4);
				done();
			});
		});

		it('can run many tasks with many workers', function(done) {
			function squareAsync () {
				return task.run({
					arguments: arguments,
					function: function (number) {
						return Math.pow(number, 2);
					}
				});
			}


			var numbers = [];
			for (var i = 0; i < 100; i++) {
				numbers.push(i);
			}

			Promise.map(numbers, squareAsync).then(function (numbers) {
				expect(numbers).toEqual([ 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625, 676, 729, 784, 841, 900, 961, 1024, 1089, 1156, 1225, 1296, 1369, 1444, 1521, 1600, 1681, 1764, 1849, 1936, 2025, 2116, 2209, 2304, 2401, 2500, 2601, 2704, 2809, 2916, 3025, 3136, 3249, 3364, 3481, 3600, 3721, 3844, 3969, 4096, 4225, 4356, 4489, 4624, 4761, 4900, 5041, 5184, 5329, 5476, 5625, 5776, 5929, 6084, 6241, 6400, 6561, 6724, 6889, 7056, 7225, 7396, 7569, 7744, 7921, 8100, 8281, 8464, 8649, 8836, 9025, 9216, 9409, 9604, 9801 ]);
				done();
			});
		});


		it('can run many tasks with one worker', function(done) {
			let customTask = task.defaults({
				maxWorkers: 1
			});

			function squareAsync () {
				return customTask.run({
					arguments: arguments,
					function: function (number) {
						return Math.pow(number, 2);
					}
				});
			}

			var numbers = [];
			for (var i = 0; i < 100; i++) {
				numbers.push(i);
			}

			Promise.map(numbers, squareAsync).then(function (numbers) {
				expect(numbers).toEqual([ 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625, 676, 729, 784, 841, 900, 961, 1024, 1089, 1156, 1225, 1296, 1369, 1444, 1521, 1600, 1681, 1764, 1849, 1936, 2025, 2116, 2209, 2304, 2401, 2500, 2601, 2704, 2809, 2916, 3025, 3136, 3249, 3364, 3481, 3600, 3721, 3844, 3969, 4096, 4225, 4356, 4489, 4624, 4761, 4900, 5041, 5184, 5329, 5476, 5625, 5776, 5929, 6084, 6241, 6400, 6561, 6724, 6889, 7056, 7225, 7396, 7569, 7744, 7921, 8100, 8281, 8464, 8649, 8836, 9025, 9216, 9409, 9604, 9801 ]);
				done();
			});
		});

		if (CompatibilityWorkerProxy) {
			it('can run many tasks with a compatibility worker', function(done) {
				let customTask = task.defaults({
					maxWorkers: 1
				}, CompatibilityWorkerProxy);

				function squareAsync () {
					return customTask.run({
						arguments: arguments,
						function: function (number) {
							return Math.pow(number, 2);
						}
					});
				}

				var numbers = [];
				for (var i = 0; i < 10; i++) {
					numbers.push(i);
				}

				Promise.map(numbers, squareAsync).then(function (numbers) {
					expect(numbers).toEqual([ 0, 1, 4, 9, 16, 25, 36, 49, 64, 81 ]);
					done();
				});
			});
		}

		it('can use wrap', function(done) {
			function pow(number) {
				return Math.pow(number, 2);
			}

			var powAsync = task.wrap(pow);

			var numbers = [];
			for (var i = 0; i < 10; i++) {
				numbers.push(i);
			}

			Promise.map(numbers, powAsync).then(function (numbers) {
				expect(numbers).toEqual([ 0, 1, 4, 9, 16, 25, 36, 49, 64, 81 ]);
				done();
			});
		});

		it('can handle an error using promises', function(done) {
			function pow(number) {
				return Math.pow(number, undefinedVar);
			}

			var powAsync = task.wrap(pow);

			var numbers = [];
			for (var i = 0; i < 10; i++) {
				numbers.push(i);
			}

			Promise.map(numbers, powAsync).then(function (numbers) {
			}, function (error) {
				expect(!!error.toString().match(/undefinedVar/)).toEqual(true);
				done();
			});
		});

		it('can handle an error using callbacks', function(done) {
			function pow(number) {
				return Math.pow(number, undefinedVar);
			}

			var powAsync = task.wrap(pow);

			powAsync(1, function (error, number) {
				expect(!!error.toString().match(/undefinedVar/)).toEqual(true);
				done();
			});
		});

		it('can terminate', function(done) {
			let customTask = task.defaults({
				maxWorkers: 1
			}, CompatibilityWorkerProxy);

			function pow(number) {
				return Math.pow(number, 2);
			}

			var powAsync = customTask.wrap(pow);

			var numbers = [];
			for (var i = 0; i < 10; i++) {
				numbers.push(i);
			}

			Promise.map(numbers, powAsync).then(function (numbers) {
				expect(customTask._workers.length).toEqual(1);
				customTask.terminate();
				expect(customTask._workers.length).toEqual(0);
				done();
			});
		});
	}
};