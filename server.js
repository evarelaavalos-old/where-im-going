const puppeteer = require('puppeteer');
const destinationUrl = 'https://www.google.com/';
const screenshotPath = 'screenshots';
let textToSearch = 'beautiful corgi puppies';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(destinationUrl);
        
        // Searching in Google Main Page
        const googleSearchEl = await page.$('input[type=\"text\"]');
        await googleSearchEl.type(textToSearch);
        await googleSearchEl.press('Enter');
        await page.waitForNavigation();
        
        // Moving to the second result page
        const nextPageEl = await page.$('a#pnnext');
        await nextPageEl.click();
        await page.waitForNavigation();
        
        await page.screenshot({path: `${screenshotPath}/buddy-screenshot.png`, fullPage: true});

        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();