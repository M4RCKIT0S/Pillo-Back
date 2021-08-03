const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./Routes/userRoutes');

/**
 * Initial setup of app, mainly found in express documentation
 */
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use('/user', userRoutes);

module.exports = app;