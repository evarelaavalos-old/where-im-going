const puppeteer = require('puppeteer');
const destinationUrl = 'https://www.google.com/';
const screenshotPath = 'screenshots';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(destinationUrl);
        
        // Searching in Google Main Page
        const googleSearchEl = await page.$('input[type=\"text\"]');
        await googleSearchEl.type('some other text');
        await googleSearchEl.press('Enter'); // <- This line didn't work
        await page.waitForNavigation();

        await page.screenshot({path: `${screenshotPath}/buddy-screenshot.png`});

        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();