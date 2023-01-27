/* eslint-disable import/no-unresolved */

const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');

require('dotenv').config(app.env);
//console.log(process.env);

const authToken2 = process.env.AUTHTOKEN2;
const dashboard0ID = '63973c77b28f93494ec19fa3'; //belongs to dummy_user2
const wrongdashID = '6390be757de6d2fa567a3e34';
const user_name = 'dummy2';
const dummy2_id = '638e4b3d0618e2216c0ac833';

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
  // console.log(body.dashboards);
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

  //console.log(body);
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
  Test for post request save-dashboard,
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

/*
  Test for post request clone-dashboard,
  returns success=true if given name does not already exists
  else if given name exists it returns status code = 409
*/
test('POST /clone-dashboard returns correct response and status code', async t => {
  const token = authToken2;
  const dashboardId = dashboard0ID;

  // not run every time (would fill database with junk)
  // const name = 'cloned_dashboard2';
  // const body = await t.context.got.post(`dashboards/clone-dashboard?token=${token}`, {
  //   json: { dashboardId, name }
  // }).json();
  // t.assert(body.success);

  const existing_name = 'dummyDashboard';
  const body2 = await t.context.got.post(`dashboards/clone-dashboard?token=${token}`, {
    json: { dashboardId, 'name': existing_name }
  }).json();

  t.is(body2.status, 409);
});

/*
  Test for post request share-dashboard,
  returns success=true, shared if dashboard with that id exists and belong to the specific user
  else if dashboard with given id doesn't exist (for the specific user) it returns status code = 409
*/
test('POST /share-dashboard returns correct response and status code', async t => {
  const token = authToken2;

  // everytime we run this the shared status changes(true/false)
  // const dashboardId = '63973c77b28f93494ec19fa3';
  // const body = await t.context.got.post(`dashboards/share-dashboard?token=${token}&id=${dummy2_id}`, {
  //   json: { dashboardId }
  // }).json();
  // // console.log(body);
  // t.assert(body.success);

  // check error case
  const body2 = await t.context.got.post(`dashboards/share-dashboard?token=${token}&id=${dummy2_id}`, {
    json: { wrongdashID }
  }).json();
  t.is(body2.status, 409);
});

/*
  Test for post request change-password,
  returns success=true if dashboard with that id exists and password changed
  else if dashboard with given id doesn't exist (for the specific user) it returns status code = 409
*/
test('POST /change-password returns correct response and status code', async t => {
  const token = authToken2;
  const password = 'dashpass';

  const dashboardId = dashboard0ID;
  const body = await t.context.got.post(`dashboards/change-password?token=${token}&id=${dummy2_id}`, {
    json: { dashboardId, password }
  }).json();
  // console.log(body);
  t.assert(body.success);

  // check error case (not found)
  const body2 = await t.context.got.post(`dashboards/change-password?token=${token}&id=${dummy2_id}`, {
    json: { wrongdashID, password }
  }).json();
  t.is(body2.status, 409);
});

/*
  Test for post request check-password-needed,
  returns success=true, shared, passwordNeeded and dashboard's attributes if dashboard found and i am the owner || dashboard shared and pass not needed
  else if dashboard with specific id not found it returns status code = 409
  some cases not checked (would be redundant)
*/
test('POST /check-password-needed returns correct response and status code', async t => {
  let dashboardId = dashboard0ID;
  const user = { "name": user_name, "password": '', "email": '' };

  const body = await t.context.got.post("dashboards/check-password-needed", {
    json: { user, dashboardId }
  }).json();
  t.assert(body.success);

  dashboardId = wrongdashID;
  const body2 = await t.context.got.post("dashboards/check-password-needed", {
    json: { user, dashboardId }
  }).json();

  t.is(body2.status, 409);
});

/*
  Test for post request check-password,
  returns success=true, correctPassword=true, owner's id, dashsboard's attributes if dashboard with that id exists and passwords match
  else if dashboard exists but passwords don't match, returns success=true, correctPassword=flase
  else if dashboard with specific id not found it returns status code = 409
*/
test('POST /check-password returns correct response and status code', async t => {
  let dashboardId = dashboard0ID;
  let password = 'dashpass'; //correct password

  const body = await t.context.got.post("dashboards/check-password", {
    json: { dashboardId, password }
  }).json();
  t.assert(body.success);

  // check error case (passwords don't match)
  password = 'notcorrect';
  const body2 = await t.context.got.post("dashboards/check-password", {
    json: { dashboardId, password }
  }).json();

  t.assert(body2.success);
  t.assert(!body2.shared);

  // check error case (not found)
  dashboardId = wrongdashID;
  password = 'dashpass';
  const body3 = await t.context.got.post("dashboards/check-password", {
    json: { dashboardId, password }
  }).json();

  t.is(body3.status, 409);
});