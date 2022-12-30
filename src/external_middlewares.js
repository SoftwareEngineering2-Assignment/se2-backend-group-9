/**
 * File that load the external middlewares for index.js
 */

const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('morgan');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(cors());
app.use(helmet());
// App configuration
app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

module.exports = app;