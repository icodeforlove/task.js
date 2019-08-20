import 'babel-polyfill';

window.Promise = require('bluebird');

import Task from '../../src/client';

describe('General Tests', require(`${__dirname}/../general.js`)(
	Task,
	Promise,
	{workerType: 'compatibility_worker'}
));