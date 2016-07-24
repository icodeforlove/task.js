var _ = require('lodash');

module.exports = function(config) {
	if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
		console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.')
		process.exit(1)
	}

	// Browsers to run on Sauce Labs
	// Check out https://saucelabs.com/platforms for all browser/OS combos

	var launchers = [
		// Mac 10.11 Browsers
		{platform: 'Mac 10.11', browserName: 'chrome', version: 'latest'},
		{platform: 'Mac 10.11', browserName: 'chrome', version: 'latest-1'},
		{platform: 'Mac 10.11', browserName: 'chrome', version: 'latest-2'},

		{platform: 'Mac 10.11', browserName: 'firefox', version: 'latest'},
		{platform: 'Mac 10.11', browserName: 'firefox', version: 'latest-1'},
		{platform: 'Mac 10.11', browserName: 'firefox', version: 'latest-2'},

		{platform: 'Mac 10.11', browserName: 'safari', version: 'latest'},

		// Mac 10.10 Browsers
		{platform: 'Mac 10.10', browserName: 'chrome', version: 'latest'},
		{platform: 'Mac 10.10', browserName: 'firefox', version: 'latest'},
		{platform: 'Mac 10.10', browserName: 'safari', version: 'latest'},

		// Mac 10.9 Browsers
		{platform: 'Mac 10.9', browserName: 'chrome', version: 'latest'},
		{platform: 'Mac 10.9', browserName: 'firefox', version: 'latest'},
		{platform: 'Mac 10.9', browserName: 'safari', version: 'latest'},

		// Android 5.1
		//{platformName: 'Android', deviceName: 'Android Emulator', platformVersion: '5.1', browserName: 'Browser'},

		// Android 5.0
		//{platformName: 'Android', deviceName: 'Android Emulator', platformVersion: '5.0', browserName: 'Browser'},

		// // Android 4.4
		// {platformName: 'Android', deviceName: 'Android Emulator', platformVersion: '4.4', browserName: 'Browser'},

		// // Android 4.3
		// {platformName: 'Android', deviceName: 'Android Emulator', platformVersion: '4.3', browserName: 'Browser'},

		// // Android 4.2
		// {platformName: 'Android', deviceName: 'Android Emulator', platformVersion: '4.2', browserName: 'Browser'},

		// // Android 4.1
		// {platformName: 'Android', deviceName: 'Android Emulator', platformVersion: '4.1', browserName: 'Browser'},

		// iOS 9.0
		{platformName: 'iOS', deviceName: 'iPhone Simulator', platformVersion: '9.0', browserName: 'Safari'},
		//{platformName: 'iOS', deviceName: 'iPad Simulator', platformVersion: '9.0', browserName: 'Safari'},

		// iOS 8.1
		{platformName: 'iOS', deviceName: 'iPhone Simulator', platformVersion: '8.1', browserName: 'Safari'},
		//{platformName: 'iOS', deviceName: 'iPad Simulator', platformVersion: '8.1', browserName: 'Safari'},

		// iOS 7.0
		{platformName: 'iOS', deviceName: 'iPhone Simulator', platformVersion: '7.0', browserName: 'Safari', appiumVersion: '1.5.2'},
		//{platformName: 'iOS', deviceName: 'iPad Simulator', platformVersion: '7.0', browserName: 'Safari'},

		// Windows XP Browsers
		{platform: 'Windows XP', browserName: 'chrome', version: 'latest'},
		{platform: 'Windows XP', browserName: 'firefox', version: 'latest'},
		{platform: 'Windows XP', browserName: 'internet explorer', version: 'latest'},

		// Windows 7 Browsers
		{platform: 'Windows 7', browserName: 'chrome', version: 'latest'},
		{platform: 'Windows 7', browserName: 'firefox', version: 'latest'},
		{platform: 'Windows 7', browserName: 'opera', version: 'latest'},
		{platform: 'Windows 7', browserName: 'internet explorer', version: 'latest'},

		// Windows 8 Browsers
		{platform: 'Windows 8', browserName: 'chrome', version: 'latest'},
		{platform: 'Windows 8', browserName: 'firefox', version: 'latest'},
		{platform: 'Windows 8', browserName: 'opera', version: 'latest'},
		{platform: 'Windows 8', browserName: 'internet explorer', version: 'latest'},

		// Windows 8.1 Browsers
		{platform: 'Windows 8.1', browserName: 'chrome', version: 'latest'},
		{platform: 'Windows 8.1', browserName: 'firefox', version: 'latest'},
		{platform: 'Windows 8.1', browserName: 'opera', version: 'latest'},
		{platform: 'Windows 8.1', browserName: 'internet explorer', version: 'latest'},

		// Windows 10 Browsers
		{platform: 'Windows 10', browserName: 'chrome', version: 'latest'},
		{platform: 'Windows 10', browserName: 'chrome', version: 'latest-1'},
		{platform: 'Windows 10', browserName: 'chrome', version: 'latest-2'},

		{platform: 'Windows 10', browserName: 'firefox', version: 'latest'},
		{platform: 'Windows 10', browserName: 'firefox', version: 'latest-1'},
		{platform: 'Windows 10', browserName: 'firefox', version: 'latest-2'},

		{platform: 'Windows 10', browserName: 'opera', version: 'latest'},

		{platform: 'Windows 10', browserName: 'internet explorer', version: 'latest'},

		// Linux Browsers
		{platform: 'Linux', browserName: 'chrome', version: 'latest'},
		{platform: 'Linux', browserName: 'firefox', version: 'latest'},
		{platform: 'Linux', browserName: 'opera', version: 'latest'},
	];

	// generate launcher object
	var customLaunchers = {};
	launchers
		.map(launcher => {
			// add base to all browsers
			launcher.base = 'SauceLabs';

			// add defaults
			if (launcher.deviceName) {
				if (!launcher.appiumVersion) {
					launcher.appiumVersion = '1.5.3';
				}
				launcher.deviceOrientation = 'portrait';
			}

			return launcher;
		})
		// conform to customLaunchers key/value format
		.forEach((launcher, index) => customLaunchers[`${launcher.platform || launcher.platformName}:${launcher.deviceName || launcher.browserName}:${launcher.version || launcher.platformVersion}`] = launchers[index]);

	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		files: [
				`${__dirname}/../client/*.js`,
					'../client/*.js'
		],

		// list of files to exclude
		exclude: [
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
				[`${__dirname}/../client/*.js`]: ['webpack']
		},

		webpack: require(`${__dirname}/../../webpack.config`).CLIENT_KARMA_CONFIG,

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress', 'saucelabs'],

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		sauceLabs: {
			testName: 'Karma Test Matrix',
			recordScreenshots: false,
			connectOptions: {
				port: 5757,
				logfile: 'sauce_connect.log'
			},
			public: 'public'
		},

		// Increase timeout in case connection in CI is slow
		captureTimeout: 60000 * 5,
		browserDisconnectTimeout: 60000 * 5,
		browserNoActivityTimeout: 60000 * 5,
		customLaunchers: customLaunchers,
		browsers: Object.keys(customLaunchers),
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: 3
	})
}
