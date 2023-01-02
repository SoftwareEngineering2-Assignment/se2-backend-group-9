/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const { authorization } = require('../middlewares');

const router = express.Router();

const Dashboard = require('../models/dashboard');

router.post('/clone-dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const { dashboardId, name } = req.body;

      const foundDashboard = await Dashboard.findOne({ owner: mongoose.Types.ObjectId(req.decoded.id), name });
      if (foundDashboard) {
        return res.json({
          status: 409,
          message: 'A dashboard with that name already exists.'
        });
      }

      const oldDashboard = await Dashboard.findOne({ _id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(req.decoded.id) });

      await new Dashboard({
        name,
        layout: oldDashboard.layout,
        items: oldDashboard.items,
        nextId: oldDashboard.nextId,
        owner: mongoose.Types.ObjectId(req.decoded.id)
      }).save();

      return res.json({ success: true });
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/check-password-needed',
  async (req, res, next) => {
    try {
      const { user, dashboardId } = req.body;
      const userId = user.id;

      const foundDashboard = await Dashboard.findOne({ _id: mongoose.Types.ObjectId(dashboardId) }).select('+password');
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }

      const dashboard = {};
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;

      if (userId && foundDashboard.owner.equals(userId)) {
        foundDashboard.views += 1;
        await foundDashboard.save();

        return res.json({
          success: true,
          owner: 'self',
          shared: foundDashboard.shared,
          hasPassword: foundDashboard.password !== null,
          dashboard
        });
      }
      if (!(foundDashboard.shared)) {
        return res.json({
          success: true,
          owner: '',
          shared: false
        });
      }
      if (foundDashboard.password === null) {
        foundDashboard.views += 1;
        await foundDashboard.save();

        return res.json({
          success: true,
          owner: foundDashboard.owner,
          shared: true,
          passwordNeeded: false,
          dashboard
        });
      }
      return res.json({
        success: true,
        owner: '',
        shared: true,
        passwordNeeded: true
      });
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/check-password',
  async (req, res, next) => {
    try {
      const { dashboardId, password } = req.body;

      const foundDashboard = await Dashboard.findOne({ _id: mongoose.Types.ObjectId(dashboardId) }).select('+password');
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      if (!foundDashboard.comparePassword(password, foundDashboard.password)) {
        return res.json({
          success: true,
          correctPassword: false
        });
      }

      foundDashboard.views += 1;
      await foundDashboard.save();

      const dashboard = {};
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;

      return res.json({
        success: true,
        correctPassword: true,
        owner: foundDashboard.owner,
        dashboard
      });
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/share-dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const { dashboardId } = req.body;
      const { id } = req.decoded;

      const foundDashboard = await Dashboard.findOne({ _id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(id) });
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      foundDashboard.shared = !(foundDashboard.shared);

      await foundDashboard.save();

      return res.json({
        success: true,
        shared: foundDashboard.shared
      });
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/change-password',
  authorization,
  async (req, res, next) => {
    try {
      const { dashboardId, password } = req.body;
      const { id } = req.decoded;

      const foundDashboard = await Dashboard.findOne({ _id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(id) });
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      foundDashboard.password = password;

      await foundDashboard.save();

      return res.json({ success: true });
    } catch (err) {
      return next(err.body);
    }
  });

module.exports = router;
