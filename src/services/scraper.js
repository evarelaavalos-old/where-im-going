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

class GoogleScraper {
    constructor(query) {
        this.query = query;
        this._googleUrl = 'https://www.google.com/';
        this._browser;
        this._page;
        // this._init();
    }

    async _init() {
        try {
            // Initializing Chrome Sandbox
            this._browser = await puppeteer.launch();
            this._page = await this._browser.newPage();

            // Navigating to Google (main page)
            await this._page.goto(this._googleUrl);
            
            // Typing a Query
            const googleSearchEl = await this._page.$('input[type=\"text\"]');
            await googleSearchEl.type(this.query);
            await googleSearchEl.press('Enter');
            await this._page.waitForNavigation();
        } catch(err) {
            console.error(err);
        }
    }

    async takeScreenshot(screenshotPath) {
        let screenshotName = `Screenshot-03112021.png`;
        await this._page.screenshot({
            path: path.join(screenshotPath, screenshotName),
            fullPage: true,
        })

        return path.join(screenshotPath, screenshotName);
    }

    async close() {
        await this._browser.close();
    }
}

module.exports = {
    scrapeGoogle,
    GoogleScraper,
};