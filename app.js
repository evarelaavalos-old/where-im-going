const express = require('express');
const path = require('path');

const linksRouter = require('./src/routes/links.router');

const app = express();

const PORT = 3000;

app.use('/api/links', linksRouter);

app.use('/', express.static(path.join(__dirname, 'src', 'public')));

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
})