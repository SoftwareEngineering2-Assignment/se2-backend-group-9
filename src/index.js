const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../', '.env') });
const express = require('express');
const { error } = require('./middlewares');
const routes = require('./routes');
const { mongoose } = require('./config');
const external_middlewares = require('./external_middlewares');

const app = express();
app.use(external_middlewares);

// Mongo configuration
mongoose();

// Routes
app.use('/', routes);

// Server static files
app.use(express.static(path.join(__dirname, 'assets')));

// error handler
app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`NodeJS Server listening on port ${port}. \nMode: ${process.env.NODE_ENV}`));

module.exports = app;
