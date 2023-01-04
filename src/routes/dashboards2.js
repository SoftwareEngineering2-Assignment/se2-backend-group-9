/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const { authorization } = require('../middlewares');

const router = express.Router();

const Dashboard = require('../models/dashboard');

/**
 * Function for implementing post request for /dashboards/clone-dashboard
 * Needs authorization, takes dashboard name and id as inputs
 * Returns correct response if dashboard cloned
 * else (409) if dashboard with given name exists
 */
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

/**
 * Function for implementing post request for /dashboards/check-password-needed
 * Takes user, dashboard id as inputs
 * Returns (409) if dashboard not found
 * else returns success, and shared (false) if dashboard not shared and not owned by user
 * else returns success, owner, shared, passwordNeeded (false), dashboard if shared and password not needed
 * else returns success, owner, shared, passwordNeeded if password needed
 */
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

      const isOwner = foundDashboard.owner.equals(userId);
      const passwordNeeded = !!dashboard.password && !isOwner;

      if (!foundDashboard.shared && !isOwner) {
        return res.json({
          success: true,
          owner: '',
          shared: false,
        });
      }

      if (passwordNeeded) {
        return res.json({
          success: true,
          //if isOwner == true, return self, else dashboard.owner
          owner: isOwner ? 'self' : dashboard.owner,
          shared: true,
          passwordNeeded,
        });
      }

      foundDashboard.views += 1;
      await foundDashboard.save();

      return res.json({
        success: true,
        //if isOwner == true, return self, else dashboard.owner
        owner: isOwner ? 'self' : dashboard.owner,
        shared: true,
        passwordNeeded,
        dashboard
      });
    } catch (err) {
      return next(err.body);
    }
  });

/**
 * Function for implementing post request for /dashboards/check-password
 * Takes dashboard id and password as inputs
 * Returns success, correctPassword, owner, dashboard if dashboard found and password is correct
 * else success, correctPassword (false) if dashboard found but password is not correct
 * else (409) if dashboard not found
 */
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

/**
 * Function for implementing post request for /dashboards/share-dashboard
 * Needs authorization, takes dashboard id as input
 * Returns success, shared if dashboard found and dashboard became shared
 * else (409) if dashboard not found
 */
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

/**
 * Function for implementing post request for /dashboards/change-password
 * Needs authorization, takes dashboard id and password as inputs
 * Returns success if dashboard was found and password changed
 * else success, correctPassword (false) if dashboard found but password is not correct
 * else (409) if dashboard not found
 */
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
