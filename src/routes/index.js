const express = require('express');

// Import the routing modules for different resources
const users = require('./users');
const sources = require('./sources');
const dashboards1 = require('./dashboards1');
const dashboards2 = require('./dashboards2');
const general = require('./general');
const root = require('./root');

const router = express.Router();

// Set up routes for each resource
router.use('/users', users);
router.use('/sources', sources);
router.use('/dashboards', dashboards1, dashboards2);
router.use('/general', general);
router.use('/', root);

module.exports = router;