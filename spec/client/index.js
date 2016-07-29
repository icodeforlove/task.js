import 'babel-polyfill';

window.Promise = require('bluebird');

import task from '../../src/client';
import CompatibilityWorker from '../../src/client/CompatibilityWorker';

describe('General Tests', require(`${__dirname}/../general.js`)(
	task,
	Promise,
	CompatibilityWorker
));