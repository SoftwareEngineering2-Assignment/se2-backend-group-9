const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('morgan');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Add various HTTP headers to increase security of the app
app.use(helmet());

// Enable compression of HTTP responses to improve performance
app.use(compression());

// Use Morgan for request logging, except in 'test' environment
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

// Enable parsing of JSON and url-encoded data in HTTP requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

module.exports = app;