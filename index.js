if (typeof process != 'undefined' && !process.browser) {
    // node context
    module.exports = require('./dist/server/server');
} else {
    // browser context
    module.exports = require('./dist/client/client');
}