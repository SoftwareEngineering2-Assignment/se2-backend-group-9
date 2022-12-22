/* eslint-disable import/no-unresolved */

const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');
const { jwtSign } = require('../src/utilities/authentication/helpers');
const { AssertionError } = require('node:assert');
//const { isAsyncFunction } = require('node:util/types');

require('dotenv').config(app.env);
//console.log(process.env);

const authToken1 = process.env.AUTHTOKEN1;
const authToken2 = process.env.AUTHTOKEN2;
const dummypass2 = process.env.DUMMYPASS2;
const dashboard0ID = '63973c77b28f93494ec19fa3'; //belongs to dummy_user2
const wrongdashID = '6390be757de6d2fa567a3e34';

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

/*Test for the response and status code of get statitics */
test('GET /statistics returns correct response and status code', async (t) => {
  const { body, statusCode } = await t.context.got('general/statistics');
  //t.is(body.sources, 0);
  t.assert(body.success);
  t.is(statusCode, 200);
});

/*Test for the response and status code of get test-url */
test('GET /test-url returns correct response and status code', async (t) => {
  const test_url = "https://se2-frontend-9.netlify.app/";

  const { body, statusCode } = await t.context.got(`general/test-url?url=${test_url}`);
  t.assert(body.active);
  t.is(statusCode, 200);
});

/*Test for the response and status code of get test-url, using wrong url */
test('GET /test-url returns error status code if url is not valid', async (t) => {
  const wrong_url = "htt://se2-frontend-9.netlify.app/";

  const { body, statusCode } = await t.context.got(`general/test-url?url=${wrong_url}`);
  t.assert(!body.active);
  t.is(body.status, 500);
});

/*Test for the response and status code of get test-url-request */
test('GET /test-url-request returns correct response and status code', async (t) => {
  const wrong_url = "https://se2-frontend-9.netlify.app/";
  const type = "GET";

  const { body } = await t.context.got(`general/test-url-request?url=${wrong_url}&type=${type}`);
  t.is(body.status, 200);
});

/*Test for the response and status code of get test-url-request using wrong request type url parameter */
test('GET /test-url-request returns error status code if type is wrong', async (t) => {
  const wrong_url = "https://se2-frontend-9.netlify.app/";
  const type = "GT";

  const { body } = await t.context.got(`general/test-url-request?url=${wrong_url}&type=${type}`);
  t.is(body.status, 500);
});
