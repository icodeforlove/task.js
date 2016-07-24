# task.js [![Build Status](https://travis-ci.org/icodeforlove/task.js.png?branch=master)](https://travis-ci.org/icodeforlove/task.js)

This modules is intended to make working with blocking tasks a bit easier, and is meant to work in node as well as the browser.

## important

Before using this module i want to expose the current performance issues

- Node.js

	- When using task.js in node with very large messages it can be very slow, this is due to the fact that node is copying all the messag data.

- Clientside
	- When using task.js in a browser that doesnt support transferables (or you dont use them properly) then you will notice a slow down when passing massive array buffers

Rule of thumb in node keep your object size under 150kb, and in the clientside version you can go crazy and send 40MB array buffers if transferables are supported.

## basic usage

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

# custom usage

You can override the defaults like this

```javascript
// overriding defaults (optional)
var myCustomTask = task.defaults({
	maxWorkers: 4, // (default: the system max, or 4 if it cant be resolved)
	idleTimeout: 10000, // (default: 10000ms, pass null to disable)
	idleCheckInterval: 1000 // (default: 1000ms)
});
```

### transferables

behind the scenes it's spreading your dynamic work across your cores

```javascript
var buffer = new ArrayBuffer();

task.run({
	arguments: {buffer: buffer, otherData: 123},
	transferables: [buffer] // optional, and only supported client-side
	function: function (message) {
		return message.buffer;
	}
}).then(function (buffer) {
	console.log(buffer); // 4
});
```

## todo / help

- for node add shm buffer support or something, we need a nice way to deal with spreading the cores across large chunks of data