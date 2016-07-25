const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const packageData = require('./package.json');

// common values across configs
const LIBRARY_NAME = 'task';
const CLIENT_ENTRY_PATH = `${__dirname}/src/client`;
const CLIENT_OUTPUT_PATH = `${__dirname}/dist/client`;
const DEFAULT_LOADERS = [
    {loader: 'babel', test: /\.js$/, exclude: /(node_modules)/}
];

// client dev version
module.exports.CLIENT_DEV_CONFIG = {
    entry: CLIENT_ENTRY_PATH,
    output: {
        path: CLIENT_OUTPUT_PATH,
        filename: `${LIBRARY_NAME}.js`,
        library: LIBRARY_NAME
    },
    module: {
        loaders: DEFAULT_LOADERS
    },
    plugins: [
        new webpack.BannerPlugin(`${packageData.name} - ${packageData.version} - clientside`, {})
    ]
};

// client prod version
module.exports.CLIENT_PROD_CONFIG = {
    devtool: 'source-map',
    entry: CLIENT_ENTRY_PATH,
    output: {
        path: CLIENT_OUTPUT_PATH,
        filename: `${LIBRARY_NAME}.min.js`,
        library: LIBRARY_NAME
    },
    module: {
        loaders: DEFAULT_LOADERS
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({sourceMap: true}),
        new webpack.BannerPlugin(`${packageData.name} - ${packageData.version} - clientside/minified`, {})
    ]
},

// build every run
module.exports = Object.keys(module.exports).map(key => module.exports[key]);

// external configs (not run by default)
module.exports.CLIENT_KARMA_CONFIG = {
    module: {
        loaders: DEFAULT_LOADERS
    }
};