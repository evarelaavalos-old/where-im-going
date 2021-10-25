const puppeteer = require('puppeteer');
const { UrlStorage } = require('./modules/UrlStorage/UrlStorage.js');

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
        
        
        const lastPageNumber = 10;
        for (let pageNumber = 1; pageNumber <= lastPageNumber; pageNumber++) {
            // Getting the URLS from the page
            const urls = await page.evaluate(() => {
                let googleResults = document.querySelectorAll('.g a');
                let googleResultsWithHref = [...googleResults].filter(element => element.getAttribute('onmousedown'));
                return googleResultsWithHref.map(element => element.getAttribute('href'));
            })
            UrlStorage.saveUrls(urls);

            // Getting the Next Button
            let nextPageEl = await page.$('a#pnnext');

            if (!nextPageEl) break;

            await nextPageEl.click();
            await page.waitForNavigation();
        }
        
        await page.screenshot({path: `${screenshotPath}/buddy-screenshot.png`, fullPage: true});

        console.log(UrlStorage.getUrls());

        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();