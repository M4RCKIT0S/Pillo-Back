const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/**
 * Initial setup of app, mainly found in express documentation
 */
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

module.exports = app;