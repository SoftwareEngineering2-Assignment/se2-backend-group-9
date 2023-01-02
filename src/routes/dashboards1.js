/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const { authorization } = require('../middlewares');

const router = express.Router();

const Dashboard = require('../models/dashboard');
const Source = require('../models/source');

router.get('/dashboards',
  authorization,
  async (req, res, next) => {
    try {
      const { id } = req.decoded;
      const foundDashboards = await Dashboard.find({ owner: mongoose.Types.ObjectId(id) });
      const dashboards = [];
      foundDashboards.forEach((s) => {
        dashboards.push({
          id: s._id,
          name: s.name,
          views: s.views
        });
      });

      return res.json({
        success: true,
        dashboards
      });
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/create-dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const { id } = req.decoded;
      const foundDashboard = await Dashboard.findOne({ owner: mongoose.Types.ObjectId(id), name });
      if (foundDashboard) {
        return res.json({
          status: 409,
          message: 'A dashboard with that name already exists.'
        });
      }
      await new Dashboard({
        name,
        layout: [],
        items: {},
        nextId: 1,
        owner: mongoose.Types.ObjectId(id)
      }).save();

      return res.json({ success: true });
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/delete-dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const { id } = req.body;

      const foundDashboard = await Dashboard.findOneAndRemove({ _id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id) });
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }
      return res.json({ success: true });
    } catch (err) {
      return next(err.body);
    }
  });

router.get('/dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const { id } = req.query;

      const foundDashboard = await Dashboard.findOne({ _id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id) });
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }

      const dashboard = {};
      dashboard.id = foundDashboard._id;
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;
      dashboard.nextId = foundDashboard.nextId;

      const foundSources = await Source.find({ owner: mongoose.Types.ObjectId(req.decoded.id) });
      const sources = [];
      foundSources.forEach((s) => {
        sources.push(s.name);
      });

      return res.json({
        success: true,
        dashboard,
        sources
      });
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/save-dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const { id, layout, items, nextId } = req.body;

      const result = await Dashboard.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id) }, {
        $set: {
          layout,
          items,
          nextId
        }
      }, { new: true });

      if (result === null) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }
      return res.json({ success: true });
    } catch (err) {
      return next(err.body);
    }
  });

module.exports = router;