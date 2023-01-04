/* eslint-disable max-len */
const express = require('express');
const got = require('got');
const router = express.Router();
const User = require('../models/user');
const Dashboard = require('../models/dashboard');
const Source = require('../models/source');

/**
 * Function for implementing get request for /general/statistics
 * Returns success, users, dashboards, views and sources
 */
router.get('/statistics',
  async (req, res, next) => {
    try {
      const users = await User.countDocuments();
      const dashboards = await Dashboard.countDocuments();
      const views = await Dashboard.aggregate([
        {
          $group: {
            _id: null,
            views: { $sum: '$views' }
          }
        }
      ]);
      const sources = await Source.countDocuments();

      let totalViews = 0;
      if (views[0] && views[0].views) {
        totalViews = views[0].views;
      }

      return res.json({
        success: true,
        users,
        dashboards,
        views: totalViews,
        sources
      });
    } catch (err) {
      return next(err.body);
    }
  });

/**
 * Function for implementing get request for /general/test-url
 * Takes url as input
 * Returns status code and active if ok
 * else returns (500) and active (false)
 */
router.get('/test-url',
  async (req, res) => {
    try {
      const { url } = req.query;
      const { statusCode } = await got(url);
      return res.json({
        status: statusCode,
        active: (statusCode === 200),
      });
    } catch (err) {
      return res.json({
        status: 500,
        active: false,
      });
    }
  });

/**
 * Function for implementing get request for /general/test-url-request
 * Takes url, type as inputs
 * Returns status code and response
 * else returns (500)
 */
router.get('/test-url-request',
  async (req, res) => {
    const { url, type, headers, body: requestBody, params } = req.query;

    let options = {
      headers: headers ? JSON.parse(headers) : {},
    };

    if (params) {
      options.searchParams = JSON.parse(params);
    }

    if (requestBody) {
      options.json = JSON.parse(requestBody);
    }

    try {
      let response;
      switch (type) {
        case 'GET':
          response = await (url, options);
          break;
        case 'POST':
          response = await got.post(url, options);
          break;
        case 'PUT':
          response = await got.put(url, options);
          break;
        default:
          statusCode = 500;
          body = 'Something went wrong';
      }

      return res.json({
        status: response.statusCode,
        response: response.body,
      });
    } catch (err) {
      return res.json({
        status: 500,
        response: err.toString(),
      });
    }
  });

module.exports = router;
