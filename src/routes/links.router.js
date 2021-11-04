const express = require('express');

const linksController = require('../controllers/links.controller');

const linksRouter = express.Router();

linksRouter.get('/:query', linksController.getLinks);

module.exports = linksRouter;