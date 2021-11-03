const express = require('express');
const path = require('path');

const scrapeGoogle = require('./src/services/scraper.js');

const app = express();

const PORT = 3000;

app.get('/', express.static(path.join('src', 'public')));

app.get('/api/links', async (req, res) => {
    let screenshotPath = path.join(__dirname, 'temp', 'screenshots');
    await scrapeGoogle(screenshotPath);
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
})