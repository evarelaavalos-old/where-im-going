const path = require('path');
const puppeteer = require('puppeteer');
const UrlStorage = require('./UrlStorage.js');

async function scrapeGoogle(screenshotPath) {
    if (!screenshotPath) {
        throw new Exception('The screenshot path is required.');
    }
        
    const destinationUrl = 'https://www.google.com/';
    let textToSearch = 'beautiful corgi puppies';

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
        
        await page.screenshot({path: path.join(screenshotPath, 'buddy-screenshot.png'), fullPage: true});

        console.log(UrlStorage.getUrls());

        await browser.close();
    } catch (err) {
        console.log(2, err);
    }
}

module.exports = scrapeGoogle;