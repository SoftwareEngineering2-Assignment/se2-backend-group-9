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

/*
Test for the response and status code of get dashboards
Returns all the dashboards of a user
*/
test('GET /dashboards returns correct response and status code', async (t) => {
  const token = authToken2;
  const { body, statusCode } = await t.context.got(`dashboards/dashboards?token=${token}`);

  t.assert(body.success);
  t.is(statusCode, 200);
  //console.log(body.dashboards);
});

/*
  Test for post request create-dashboard, 
  returns success if dashboard with that name doesn't exists
  else it returns 409
*/
test('POST /create-dashboard returns correct response or status code', async t => {
  const token = authToken2;
  const name = 'dummyDashboard0';

  const body = await t.context.got.post(`dashboards/create-dashboard?token=${token}`, {
    json: { name }
  }).json();

  //if body.status != undefined means that a dashboard with that name already exists
  if (body.status) {
    t.is(body.status, 409);
  }
  //if body.status = undefined (false) then dashboard is creater
  else {
    t.assert(body.success);
  }
});

/*
  Test for post request delete-dashboard,
  returns success=true if dashboard with that id exists
  else it returs status code = 409
*/
test('POST /delete-dashboard returns correct response or status code', async t => {
  const token = authToken2;
  const id = '6390b90c470d3fe4ca04063c';

  const body = await t.context.got.post(`dashboards/delete-dashboard?token=${token}`, {
    json: { id }
  }).json();

  //if body.status != undefined means that the selected dashboard has not been found
  if (body.status) {
    t.is(body.status, 409);
  }
  //if body.status == undefined then dashboard was found and deleted
  else {
    t.assert(body.success);
  }
});

/*
  Test for get request /dashboard,
  returns success=true because dashboard with that id exists
*/
test('GET /dashboard returns correct response', async t => {
  const token = authToken2;
  const id = dashboard0ID;

  const { body, statusCode } = await t.context.got(`dashboards/dashboard?token=${token}&id=${id}`);

  //if body.status != undefined means that the selected dashboard has not been found
  if (body.status) {
    t.is(body.status, 409);
  }
  //if body.status == undefined then dashboard was found
  else {
    t.assert(body.success);
    t.is(statusCode, 200);
    t.is(body.dashboard.name, 'dummyDashboard0');
  }
});

/*
  Test for get request /dashboard,
  returns status code = 409 because dashboard with that id doesn't exists
*/
test('GET /dashboard returns error status code if id is incorrect', async t => {
  const token = authToken2;
  const id = wrongdashID;

  const { body, statusCode } = await t.context.got(`dashboards/dashboard?token=${token}&id=${id}`);

  //if body.status != undefined means that the selected dashboard has not been found
  if (body.status) {
    t.is(body.status, 409);
  }
  //if body.status == undefined then dashboard was found
  else {
    t.assert(body.success);
    t.is(statusCode, 200);
    t.is(body.dashboard.name, 'dummyDashboard0');
  }
});

/*
  Test for post request delete-dashboard,
  returns success=true if dashboard with that id exists
  else if dashboard id is incorrect it returns status code = 409
*/
test('POST /save-dashboard returns correct response and status code', async t => {
  const token = authToken2;
  const id = dashboard0ID;
  const layout = [];
  const items = {};
  const nextId = 3;

  const body = await t.context.got.post(`dashboards/save-dashboard?token=${token}`, {
    json: { id, layout, items, nextId }
  }).json();
  t.assert(body.success);

  const wrongID = wrongdashID;
  const body2 = await t.context.got.post(`dashboards/save-dashboard?token=${token}`, {
    json: { wrongID, layout, items, nextId }
  }).json();

  t.is(body2.status, 409);
});
