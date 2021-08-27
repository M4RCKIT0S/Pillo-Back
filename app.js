const express = require('express');
const cors = require('cors');


const userRoutes = require('./Routes/userRoutes');
const postalCodeRoutes = require('./Routes/postalCodeRoutes');
const categoryRoutes = require('./Routes/categoryRoutes');
const shopRoutes = require('./Routes/shopRoutes');
const productRoutes = require('./Routes/productRoutes');
const shoppingChartRoutes = require('./Routes/shoppingChartRoutes');

/**
 * Initial setup of app, mainly found in express documentation
 */
const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })) /// for parsing application/x-www-form-urlencoded
app.use(cors());
app.use('/user', userRoutes);
app.use('/postalCode', postalCodeRoutes);
app.use('/category', categoryRoutes);
app.use('/shop', shopRoutes);
app.use('/product', productRoutes);
app.use('/shoppingChart', shoppingChartRoutes);

module.exports = app;