const path = require('path');

const scrapeGoogle = require('./src/services/scraper.js');

(async () => {
    let screenshotPath = path.join(__dirname, 'temp', 'screenshots');
    await scrapeGoogle(screenshotPath);
})();