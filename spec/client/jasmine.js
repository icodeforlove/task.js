const puppeteer = require('puppeteer');
const path = require('path');
const Promise = require('bluebird');

async function runJasmineTest(isDebugRetry) {
	const width = 800;
	const height = 500;
	const browser = await puppeteer.launch({
		headless: !isDebugRetry,
		args : [
			`--window-size=${width},${height}`
		]
	});
	const page = (await browser.pages())[0];
	await page.setViewport({width, height});
	console.time('clientside-test');
	await page.goto(`file:${path.join(__dirname, './test.html')}`);

	let result;
	while (result == undefined) {
		result = await page.evaluate(() => window.JASMINE_FINISHED_STATUS);
		await Promise.delay(10);
	}

	if (!isDebugRetry) {
		await browser.close();

		if (result === 'failed' && !process.env.DISABLE_DEBUG_TEST) {
			await runJasmineTest(true);
		}
	}

	if (process.env.DISABLE_DEBUG_TEST) {
		if (result === 'failed') {
			throw new Error('Client-side test has failed, please test locally');
		} else {
			console.log('Client-side test has passed');
			console.timeEnd('clientside-test');
		}
	}
}

(async () => {
	await runJasmineTest();
})();

