const path = require('path');
const puppeteer = require('puppeteer');
const UrlStorage = require('./UrlStorage.js');
const { LinksCollectorService } = require('./linkscollector.js');

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
        // TODO Make "collector" private and create an interface to manipulate it
        this.collector = new LinksCollectorService();
        this._googleUrl = 'https://www.google.com/';
        this._actualPage = -1;
    }
    
    async init() {
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

            this._actualPage = 1;
        } catch(err) {
            console.error(err);
        }
    }

    async saveLinks() {
        // TODO Search an alternative to the method .evaluate()
        let validResultsUrls = await this._page.evaluate(() => {
            // TODO There is some Google Suggestions that this
            // formula takes the links too. Fix it to not take that links.
            const isValidResult = (element) => {
                return element.getAttribute('onmousedown') &&
                    (element.childElementCount == 3) &&
                    (element.firstChild.tagName == "BR");
            }

            let results = [...document.querySelectorAll('.g a')];
            let onlyValidResults = results.filter(isValidResult);

            return onlyValidResults.map(el => el.getAttribute('href'));
        })

        const saveGoogleLink = (url, urlIndex) => {
            this.collector.saveLink({
                resultIndex: urlIndex + 1,
                resultPage: this._actualPage,
                url: url,
            });
        }

        validResultsUrls.forEach(saveGoogleLink, this);
    }

    async moveToNextPage() {
        let nextPageButton = await this._page.$('a#pnnext');

        if (!nextPageButton) throw new Error('We couldn\'t find the next button.');

        await nextPageButton.click();
        await this._page.waitForNavigation();

        this._actualPage++;
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