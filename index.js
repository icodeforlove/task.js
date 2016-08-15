if (typeof window === 'undefined') {
    // node context
    module.exports = require(__dirname + '/dist/server/server');
} else {
    // browser context
    module.exports = require(__dirname + '/dist/server/client');
}