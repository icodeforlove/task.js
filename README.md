# task.js [![Build Status](https://img.shields.io/travis/icodeforlove/task.js.svg?branch=master)](https://travis-ci.org/icodeforlove/task.js) [![Code Climate](https://img.shields.io/codeclimate/github/icodeforlove/task.js.svg)](https://codeclimate.com/github/icodeforlove/task.js)
This modules is intended to make working with blocking tasks a bit easier, and is meant to work in node as well as the browser.

## install

```
	# node
	npm install task.js


	# browser
	bower install task

	or just grab the `/dist/client/task.min.js` file directly

```

## important

Before using this module i want to expose the current performance issues

- Node.js

	- When using task.js in node with very large messages it can be very slow, this is due to the fact that node is copying all the messag data.

- Clientside
	- When using task.js in a browser that doesnt support transferables (or you dont use them properly) then you will notice a slow down when passing massive array buffers

Rule of thumb in node keep your object size under 150kb, and in the clientside version you can go crazy and send 40MB array buffers if transferables are supported.

## callbacks and promises

task.js supports both styles

```javascript
var powAsync = task.wrap(pow);

// callbacks
pow(2, function (error, result) {

});

// promises
pow(2).then(
	function (result) {},
	function (error) {}
);
```

## task.defaults (optional)

You can override the defaults like this

```javascript
// overriding defaults (optional)
var myCustomTask = task.defaults({
	maxWorkers: 4, // (default: the system max, or 4 if it cant be resolved)
	idleTimeout: 10000, // (default: 10000ms, pass null to disable)
	idleCheckInterval: 1000 // (default: 1000ms)
});
```

behind the scenes it's spreading your dynamic work across your cores

## task.wrap

You can wrap a function if the method signatures match, and it doesnt rely on any external variables.

```javascript
// non async
function pow(number) {
	return Math.pow(number, 2);
}

var powAsync = task.wrap(pow);
powAsync(2).then(function (squaredNumber) {
	console.log(squaredNumber);
});
```

But keep in mind that your function cannot reference anything inside of your current scope because its running inside of a worker.

## task.run

below is an example of using a transferable

```javascript
var buffer = new ArrayBuffer();

task.run({
	arguments: [buffer, 1234],
	transferables: [buffer] // optional, and only supported client-side
	function: function (message) {
		return message.buffer;
	}
}).then(function (buffer) {
	console.log(buffer); // 4
});
```

## task.terminate

when you run terminate it will destroy all current workers in the pool, and throw an error on all outstanding work

```javascript
task.terminate();
```

## browser tests

[![Selenium Test Status](https://saucelabs.com/browser-matrix/task-js.svg)](https://saucelabs.com/u/task-js)

## todo / help

- for node add shm buffer support or something, we need a nice way to deal with spreading the cores across large chunks of data
- add opensauce tests?
