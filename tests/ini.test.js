/* eslint-disable import/no-unresolved */

const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');

require('dotenv').config(app.env);
//console.log(process.env);

/* Method for initializing server for tests */
test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({ http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl });
});

/* Method for closing the test server */
test.after.always((t) => {
  t.context.server.close();
});
