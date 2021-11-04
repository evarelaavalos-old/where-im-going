const path = require('path');

const GoogleScraper = require('../services/scraper.js');

async function getLinks(req, res) {
    try {
        // Initializa the Google Scraper
        const SEARCH = 'beautiful corgi puppies';
        const scraper = new GoogleScraper(SEARCH);
        await scraper.init();

        // Start saving links
        const PAGES_TO_SCRAPE = 10;
        for (let actualPage = 1; actualPage <= PAGES_TO_SCRAPE; actualPage++) {
            await scraper.saveLinks();
            try { await scraper.moveToNextPage(); } catch (err) { break; }
        }

        // Take screenshot of the last page
        let exportPath = path.join(__dirname, '..', '..', 'temp', 'screenshots');
        await scraper.takeScreenshot(exportPath);

        // Close the scraper
        scraper.close();

        // Response with the scraped links
        let options = {};
        let savedLinks = scraper.collector.getLinks(options);
        res.json(savedLinks);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

module.exports = {
    getLinks
}