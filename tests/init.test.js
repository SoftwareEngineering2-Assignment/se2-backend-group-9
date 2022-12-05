/* eslint-disable import/no-unresolved */
require('dotenv').config();

const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');

test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});
});

test.after.always((t) => {
  t.context.server.close();
});

test('GET /statistics returns correct response and status code', async (t) => {
  const {body, statusCode} = await t.context.got('general/statistics');
  t.is(body.sources, 0);
  t.assert(body.success);
  t.is(statusCode, 200);
});

test('GET /sources returns correct response and status code', async (t) => {
  const token = jwtSign({id: 1});
  const {statusCode} = await t.context.got(`sources/sources?token=${token}`);
  t.is(statusCode, 200);
});

test('GET /dashboard returns correct response and status code', async (t) => {
  const token = jwtSign({id: 1});
  const {body, statusCode} = await t.context.got(`dashboards/dashboards?token=${token}`);
  t.assert(body.success);
  t.is(statusCode, 200);
});

test('POST /create should return error if user exists', async t => {
  const username = 'dummy';
  const password = '12345678';
  const email = 'dummy@gmail.com';
  
  const data = await t.context.got.post(`users/create`, {
        json: { username, password, email }
      }).json();
  t.is(data.status, 409);
})

test('POST /authenticate authenticates correctly a dummy user', async t => {
  
  //change to secrets
  
  const username = 'dummy';
  const password = '12345678';
  
  const data = await t.context.got.post(`users/authenticate`, {
        json: { username, password }
      }).json();
  t.is(data.user.username, username);
})