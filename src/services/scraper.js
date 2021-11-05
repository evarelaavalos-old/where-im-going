const path = require('path');
const puppeteer = require('puppeteer');
const { LinksCollectorService } = require('./linkscollector.js');

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
                page: this._actualPage,
                index: urlIndex + 1,
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

module.exports = GoogleScraper;