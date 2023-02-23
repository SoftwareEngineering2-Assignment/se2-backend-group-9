/* eslint-disable max-len */
const express = require('express');
const got = require('got');
const router = express.Router();
const User = require('../models/user');
const Dashboard = require('../models/dashboard');
const Source = require('../models/source');
const mongoose = require('mongoose');

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
    try {
      const { url, type, headers, body: requestBody, params } = req.query;

      let statusCode;
      let body;
      switch (type) {
        case 'GET':
          ({ statusCode, body } = await got(url, {
            headers: headers ? JSON.parse(headers) : {},
            searchParams: params ? JSON.parse(params) : {}
          }));
          break;
        case 'POST':
          ({ statusCode, body } = await got.post(url, {
            headers: headers ? JSON.parse(headers) : {},
            json: requestBody ? JSON.parse(requestBody) : {}
          }));
          break;
        case 'PUT':
          ({ statusCode, body } = await got.put(url, {
            headers: headers ? JSON.parse(headers) : {},
            json: requestBody ? JSON.parse(requestBody) : {}
          }));
          break;
        default:
          statusCode = 500;
          body = 'Something went wrong';
      }

      return res.json({
        status: statusCode,
        response: body,
      });
    } catch (err) {
      return res.json({
        status: 500,
        response: err.toString(),
      });
    }
  });

/**
* Function for implementing get request for /general/test-db
* Takes uri, collection as inputs
* Returns success and data
* else returns success (false)
*/
router.get('/test-db',
  async (req, res) => {
    try {
      const { uri, collection } = req.query;
      const mongooseOptions = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        poolSize: 100,
        keepAlive: true,
        keepAliveInitialDelay: 300000
      };
      try {
        const conn = await mongosose.createConnection(uri, mongooseOptions);
        const Coll = mongoose.models.Custom || mongoose.model('Custom', new mongoose.Schema(), collection);
        const data = await Coll.find();
        await conn.close();
        return res.json({
          success: true,
          data,
        });
      } catch (err) {
        return res.json({
          success: false,
          message: 'Could not connect to db',
        });
      }
    } catch (err) {
      return res.json({ success: false });
    }
  });

module.exports = router;
