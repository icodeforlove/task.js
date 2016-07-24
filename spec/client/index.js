import 'babel-polyfill';

window.Promise = require('bluebird');

import task from '../../src/client';
import CompatibilityWorkerProxy from '../../src/client/CompatibilityWorkerProxy';

describe('General Tests', require(`${__dirname}/../general.js`)(
	task,
	Promise,
	CompatibilityWorkerProxy
));