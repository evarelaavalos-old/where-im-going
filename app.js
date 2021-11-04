const express = require('express');
const path = require('path');

const { scrapeGoogle, GoogleScraper } = require('./src/services/scraper.js');

const app = express();

const PORT = 3000;

app.get('/', express.static(path.join('src', 'public')));

app.get('/api/links', async (req, res) => {
    try {
        const scraper = new GoogleScraper('beautiful corgi puppies');
        await scraper._init();
    
        let exportPath = path.join(__dirname, 'temp', 'screenshots');
        let file = await scraper.takeScreenshot(exportPath);
    
        scraper.close();

        res.sendFile(file);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
})