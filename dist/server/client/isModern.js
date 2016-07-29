'use strict';

var _functionToObjectURL = require('./functionToObjectURL');

var _functionToObjectURL2 = _interopRequireDefault(_functionToObjectURL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function isModern() {
	if (typeof Worker != 'undefined' && (window.URL || window.webkitURL)) {
		try {
			var worker = new Worker((0, _functionToObjectURL2.default)(function () {}));
			worker.terminate();
			return true;
		} catch (error) {}
	}

	return false;
};