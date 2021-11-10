const path = require('path');

const GoogleScraper = require('../services/scraper.js');

async function getLinks(req, res) {
    try {
        if (!req.params.query) {
            return res.status(400).json({
                error: 'Missing Query',
            })
        }
        
        // Logging the Incoming Request
        console.log('Query String: ', req.query);

        // Process the query string
        const DEFAULT_PAGES_TO_SCRAPE = 5;
        const settings = parseSettings(req.query);

        // Process and Log the search
        const search = req.params.query.replace(/\-/g, ' ');
        console.log(search);

        // Initialize the Google Scraper
        const scraper = new GoogleScraper(search);
        await scraper.init();

        // Start saving links
        const pagesToScrape = settings.pages ?? DEFAULT_PAGES_TO_SCRAPE;
        for (let actualPage = 1; actualPage < pagesToScrape; ++actualPage) {
            await scraper.saveLinks();
            try { await scraper.moveToNextPage(); } catch (err) { break; }
        }

        // Take screenshot of the last page
        let exportPath = path.join(__dirname, '..', '..', 'temp', 'screenshots');
        await scraper.takeScreenshot(exportPath, req.params.query);

        // Close the scraper
        scraper.close();

        // Response with the scraped links
        // TODO Provide a way in the API to change this options. (Hard Code)
        // TODO removeProtocol, removePath
        let options = {
            normalized: settings.normalize,
            uniqueValues: settings.unique,
            sorted: settings.sort,
            onlyUrls: settings.onlyurls,
        };
        
        let savedLinks = scraper.collector.getLinks(options);

        let exportOptions = {
            fileName: req.params.query,
            pathToExport: path.join(__dirname, '..', '..', 'temp', 'searchs'),
        }

        scraper.collector.export({ ...options, ...exportOptions });

        res.json(savedLinks);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

function parseSettings(query) {
    for (const [key, value] of Object.entries(query)) {
        if (key === 'pages') {
            query[key] = Number(value);
        } else if (value === 'on') {
            query[key] = true;
        } else if (value === 'off') {
            query[key] = false;
        }
    }

    return query;
}

module.exports = {
    getLinks
}