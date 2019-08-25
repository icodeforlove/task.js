# task.js [![Build Status](https://img.shields.io/travis/icodeforlove/task.js.svg?branch=master)](https://travis-ci.org/icodeforlove/task.js) [![Code Climate](https://api.codeclimate.com/v1/badges/31e1fc75ec7591e84fb4/maintainability)](https://codeclimate.com/github/icodeforlove/task.js) [![CDNJS](https://img.shields.io/cdnjs/v/task.js.svg)](https://cdnjs.com/libraries/task.js)
This module is intended to make working with blocking tasks a bit easier, and is meant to work in node as well as the browser.

**[LIVE DEMO](https://codepen.io/icodeforlove/full/ZOjBBB)**

It works by creating a worker pool, and sending tasks to workers that are not busy. If all workers are busy then the task gets queued until there is room.

## install

```
# node
npm install task.js

# usage
import Task from 'task.js';
```

or just grab the [cdnjs hosted version](https://cdnjs.com/libraries/task.js) directly

## usage

```javascript
let task = new Task({/* options */});

await task.run(
	number => Math.pow(number, 2),
	2
); // returns 4
```

## options

- **debug = false** *[Boolean]* enables verbose event logging
- **logger = console.log** *[Function]* allows you to override logging, or handle the events in a custom manner
- **workerType = undefined** *[String]* allows you to override the worker type, currently is only useful in node.js with `worker_threads`, or `fork_worker` 
- **warmStart = true** *[Boolean]* creates all workers before running tasks
- **maxWorkers = 1** *[Integer]* you can use `os.cpus().length` or `navigator.hardwareConcurrency` to obtain the system core count (do not set this value higher than the amount of cores on the machine)
- **workerTaskConcurrency = 1** *[Integer]* useful if you are running async tasks, it allow allow a worker to handle multiple tasks at the same time
- **taskTimeout = 0** *[Integer]* useful when trying to prevent long running tasks from stalling. It will kill the offending working and recreate another one, and reissue its tasks to the pool.
- **requires** *[Object]* key value require object like the following `{qs: 'querystring'}`, all keys would become globals. **This is only supported in Node.js!**
- **globals = {}** *[Object]* sets global variables in all workers {foo: 'bar'}, would set `foo` to `'bar'`
- **initialize = undefined** *[Function]* you can use `global.foo = 'bar'` within this function to 

**The `Function/String` you pass into `.run` or `.wrap` is ran inside of the workers context. So it will NOT have access to your main threads variable scope. If you would like to pass information into the task you need to use function arguments, or `task globals`.**

## task.wrap (Func|String)

You can wrap a function if the method signatures match, and it doesn't rely on any external variables.

```javascript
// non async
let pow = task.wrap(number => Math.pow(number, 2));

console.log(await pow(2));
```

But keep in mind that your function cannot reference anything inside of your current scope because it is running inside of a worker.

## task.run(Func|String, [...arguments])

Below is an example of using a transferable

```javascript
// create buffer backed array
var array = new Float32Array([1,3,3,7]);

let result = await task.run(
	array => {
		// do intensive operations on your buffer
    	return array.buffer;
	},
	array,
	Task.transferables(array)
);
```

## task.terminate

When you run terminate it will destroy all current workers in the pool, and throw an error on all outstanding work.

```javascript
task.terminate();
```

## globals in workers

You can initialize a task instance to have predefined data from your main thread, or generated within the worker.

```javascript
let data = {foo: 'foo'};

let task = new Task({
	globals: {
		data: data,
		bar: 'bar'
	}
});

await task.run(() => {
	console.log(data.foo + bar);
});
```

You can also use initialize to define common methods in the worker scope as well.

```javascript
task.defaults({
	globals: {
		foo: 'foo',
		bar: 'bar'
	},
	initialize: () => {
		global.fooBar = () => {
			return foo + bar;
		}
	}
});

await task.run(() => {
	console.log(fooBar());
});
```

Keep in mind that it is ok to have a slow initialize, no work will actually be processed until there is a fully initialized worker.

## async tasks

Tasks can use `async`, and return promises

```javascript
let task = new Task({
	requires: {
		request: 'request-promise'
	}
});

let workerRequest = task.wrap(
	async options => {
		let response = await request(options);
		// do something CPU intensive with the response
		return response;
	}
);

console.log(await workerRequest({url: 'https://www.google.com'}));
```

## shared memory

There are two ways to use shared memory 

- **[SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)** (only supported when using worker_threads in node, or web workers)
- **[Transferables](https://developer.mozilla.org/en-US/docs/Web/API/Transferable)** These are buffer backed arrays

### SharedArrayBuffer

**supported in browser:web_workers, and node:worker_threads**

When using this please make sure to use [Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics), which is supposed in both the browser, and node.

```javascript
let sharedArray = new Uint8Array(new SharedArrayBuffer(2));

await task.run(
	sharedArray => Atomics.add(sharedArray, 0, 1),
	sharedArray
);

sharedArray[1] = 2;

console.log(sharedArray); // Uint8Array [ 1, 2 ]

```

### Transferable Arrays

**supported in browser:web_workers, and node:worker_threads**

To use transferables in task.js all you need to do is pass in `Task.transferables([...Array/Buffer])` as the methods last argument with references to the same transferable arrays you passed into the method. If you do not pass this last argument in then it will be treated like a standard array, and copied instead of transferred.

```javascript
let transferableArray = new Uint8Array(1);

let result = await task.run(transferableArray => {
	transferableArray[0]++;
	return transferableArray;
}, transferableArray, Task.transferables(transferableArray));
```

## Task.transferables(...Array/Buffer)

You can pass in buffers, or buffer backed arrays. Behind the scenes task.js will pass the array buffer, according to the tranferables interface.

```
Task.transferables(transferableArray, transferableArray.buffer)
```