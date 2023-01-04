/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const { authorization } = require('../middlewares');

const router = express.Router();

const Source = require('../models/source');

/**
 * Function for implementing get request for /sources/sources
 * Needs authorization
 * Returns success and sources
 */
router.get('/sources',
  authorization,
  async (req, res, next) => {
    try {
      const { id } = req.decoded;
      const foundSources = await Source.find({ owner: mongoose.Types.ObjectId(id) });
      const sources = [];
      foundSources.forEach((s) => {
        sources.push({
          id: s._id,
          name: s.name,
          type: s.type,
          url: s.url,
          login: s.login,
          passcode: s.passcode,
          vhost: s.vhost,
          active: false
        });
      });

      return res.json({
        success: true,
        sources
      });
    } catch (err) {
      return next(err.body);
    }
  });

/**
 * Function for implementing post request for /sources/create-source
 * Needs authorization
 * Takes name, type, url, login, passcode and vhost as inputs
 * Returns success
 * else returns (409) if source with that name exists
 */
router.post('/create-source',
  authorization,
  async (req, res, next) => {
    try {
      const { name, type, url, login, passcode, vhost } = req.body;
      const { id } = req.decoded;
      const foundSource = await Source.findOne({ owner: mongoose.Types.ObjectId(id), name });
      if (foundSource) {
        return res.json({
          status: 409,
          message: 'A source with that name already exists.'
        });
      }
      await new Source({
        name,
        type,
        url,
        login,
        passcode,
        vhost,
        owner: mongoose.Types.ObjectId(id)
      }).save();

      return res.json({ success: true });
    } catch (err) {
      return next(err.body);
    }
  });

/**
 * Function for implementing post request for /sources/change-source
 * Needs authorization
 * Takes id, name, type, url, login, passcode and vhost as inputs
 * Returns success
 * else returns (409) if source with that name exists or source not found
 */
router.post('/change-source',
  authorization,
  async (req, res, next) => {
    try {
      const { id, name, type, url, login, passcode, vhost } = req.body;
      const foundSource = await Source.findOne({ _id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id) });
      if (!foundSource) {
        return res.json({
          status: 409,
          message: 'The selected source has not been found.'
        });
      }

      const sameNameSources = await Source.findOne({ _id: { $ne: mongoose.Types.ObjectId(id) }, owner: mongoose.Types.ObjectId(req.decoded.id), name });
      if (sameNameSources) {
        return res.json({
          status: 409,
          message: 'A source with the same name has been found.'
        });
      }

      foundSource.name = name;
      foundSource.type = type;
      foundSource.url = url;
      foundSource.login = login;
      foundSource.passcode = passcode;
      foundSource.vhost = vhost;
      await foundSource.save();

      return res.json({ success: true });
    } catch (err) {
      return next(err.body);
    }
  });

/**
 * Function for implementing post request for /sources/delete-source
 * Needs authorization
 * Takes id as input
 * Returns success
 * else returns (409) if source with that name exists
 */
router.post('/delete-source',
  authorization,
  async (req, res, next) => {
    try {
      const { id } = req.body;

      const foundSource = await Source.findOneAndRemove({ _id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id) });
      if (!foundSource) {
        return res.json({
          status: 409,
          message: 'The selected source has not been found.'
        });
      }
      return res.json({ success: true });
    } catch (err) {
      return next(err.body);
    }
  });

/**
 * Function for implementing post request for /sources/source
 * Takes name, owner and user as inputs
 * Returns success and source
 * else returns (409) if source not found
 */
router.post('/source',
  async (req, res, next) => {
    try {
      const { name, owner, user } = req.body;
      const userId = (owner === 'self') ? user.id : owner;
      const foundSource = await Source.findOne({ name, owner: mongoose.Types.ObjectId(userId) });
      if (!foundSource) {
        return res.json({
          status: 409,
          message: 'The selected source has not been found.'
        });
      }

      const source = {};
      source.type = foundSource.type;
      source.url = foundSource.url;
      source.login = foundSource.login;
      source.passcode = foundSource.passcode;
      source.vhost = foundSource.vhost;

      return res.json({
        success: true,
        source
      });
    } catch (err) {
      return next(err.body);
    }
  });

/**
 * Function for implementing post request for /sources/check-sources
 * Needs authorization
 * Takes sources as input
 * Returns success and newSources
 * else returns (409) if source with that name exists
 */
router.post('/check-sources',
  authorization,
  async (req, res, next) => {
    try {
      const { sources } = req.body;
      const { id } = req.decoded;

      const newSources = [];

      for (let i = 0; i < sources.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const result = await Source.findOne({ name: sources[i], owner: mongoose.Types.ObjectId(id) });
        if (!result) {
          newSources.push(sources[i]);
        }
      }

      for (let i = 0; i < newSources.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Source({
          name: newSources[i],
          type: 'stomp',
          url: '',
          login: '',
          passcode: '',
          vhost: '',
          owner: mongoose.Types.ObjectId(id)
        }).save();
      }

      return res.json({
        success: true,
        newSources
      });
    } catch (err) {
      return next(err.body);
    }
  });

module.exports = router;
