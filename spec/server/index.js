var task = require(`${__dirname}/../../dist/server/server`),
	Promise = require('bluebird');

describe('General Tests', require(`${__dirname}/../general.js`)(
	task,
	Promise
));