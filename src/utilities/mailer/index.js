// File for importing './password' and './send' and exporting them as an object
const password = require('./password');
const send = require('./send');

module.exports = {
  mail: password,
  send
};
