const express = require('express');
const path = require('path');

const router = express.Router();

// Set the file path to the index.html file in the root directory
const file = path.join(__dirname, '../../index.html');

// Serve static files from the specified file path
router.use(express.static(file));

// Set up a route that sends the index.html file as a response to a GET request
router.get('/', (req, res) => res.sendFile(file));

module.exports = router;
