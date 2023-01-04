/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Dashboard = require('../models/dashboard');

/**
 * Function for implementing post request for /dashboards/check-password-needed
 * Takes user, dashboard id as inputs
 * Returns (409) if dashboard not found
 * else returns success, and shared (false) if dashboard not shared and not owned by user
 *  else returns success, owner, shared, passwordNeeded if password needed
 * else returns success, owner, shared, passwordNeeded (false), dashboard if shared and password not needed
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

      const isOwner = foundDashboard.owner.equals(userId);
      const isShared = foundDashboard.shared;
      const hasPassword = !!foundDashboard.password;
      const passwordNeeded = hasPassword && !isOwner;

      if (!isShared && !isOwner) {
        return res.json({
          success: true,
          shared: false,
        });
      }

      if (passwordNeeded) {
        return res.json({
          success: true,
          shared: true,
          passwordNeeded,
        });
      }

      foundDashboard.views += 1;
      await foundDashboard.save();

      return res.json({
        success: true,
        shared: true,
        passwordNeeded,
        dashboard: {
          name: foundDashboard.name,
          layout: foundDashboard.layout,
          items: foundDashboard.items,
          owner: foundDashboard.owner
        }
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

module.exports = router;