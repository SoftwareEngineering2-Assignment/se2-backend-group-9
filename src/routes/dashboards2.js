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

/**
* Function for implementing post request for /dashboards/save-dashboard
* Needs authorization, takes id, layout, items, nextId as inputs
* Returns correct response if dashboard saved
* else (409) if dashboard not found
*/
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