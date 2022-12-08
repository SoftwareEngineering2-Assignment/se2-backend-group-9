/* eslint-disable import/no-unresolved */
//require('dotenv').config();

const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');
const { jwtSign } = require('../src/utilities/authentication/helpers');
const { AssertionError } = require('node:assert');
const { isAsyncFunction } = require('node:util/types');
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImR1bW15IiwiaWQiOiI2MzhlNDA5MTMxMmRiMTRjNmVjMzBlNmYiLCJlbWFpbCI6ImR1bW15QGdtYWlsLmNvbSIsImlhdCI6MTY3MDQxNjE5M30.g4hEfpH6EoN5JaBUU-O67uv4v9nUIiWtpHCLA3_cSSg';
const dashboard0ID = '6391d8972c8c733c64857525';
const wrongdashID = '6390be757de6d2fa567a3e34';

require('dotenv').config(app.env);
//console.log(process.env);

/* 
dummy user variables for tests
const username = 'dummy';
const password = '12345678';
const email = 'dummy@gmail.com';

const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImR1bW15IiwiaWQiOiI2MzhlNDA5MTMxMmRiMTRjNmVjMzBlNmYiLCJlbWFpbCI6ImR1bW15QGdtYWlsLmNvbSIsImlhdCI6MTY3MDQxNjE5M30.g4hEfpH6EoN5JaBUU-O67uv4v9nUIiWtpHCLA3_cSSg';
const dashboard0ID = '6390be757de6d2fa567a3e34';
*/

test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({ http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl });
});

test.after.always((t) => {
  t.context.server.close();
});

/*Test for the response and status code of get statitics */
test('GET /statistics returns correct response and status code', async (t) => {
  const { body, statusCode } = await t.context.got('general/statistics');
  t.is(body.sources, 0);
  t.assert(body.success);
  t.is(statusCode, 200);
});

test('GET /sources returns correct response and status code', async (t) => {
  const token = authToken;
  const { body, statusCode } = await t.context.got(`sources/sources?token=${token}`);
  t.is(statusCode, 200);
  t.assert(body.success);
});

/*Test for post request of register account with existing or user or email */
test('POST /create returns error if email or user exists', async t => {
  const username = 'dummy';
  const password = '12345678';
  const email = 'dummy@gmail.com';

  const body = await t.context.got.post(`users/create`, {
    json: { username, password, email }
  }).json();
  t.is(body.status, 409);
});

/*Test for post request for authenticating a user with username and password*/
test('POST /authenticate returns correct username', async t => {
  const username = 'dummy';
  const password = '12345678';

  const body = await t.context.got.post('users/authenticate', {
    json: { username, password }
  }).json();

  t.is(body.user.username, username);
});

// /*Test for user authentication if password is wrong (post) */
// test('POST /authenticate a dummy user with wrong pasword', async t => {

//   //change to secrets

//   const username = 'dummy';
//   const password = '135790';

//   const data = await t.context.got.post(`users/authenticate`, {
//     json: { username, password }
//   }).json();
//   t.is(data.status, 401);
// });

// /*Test for user authentication if username is wrong (post) */
// test('POST /authenticate a dummy user with wrong username', async t => {

//   //change to secrets

//   const username = 'dummmmy';
//   const password = '123456789';

//   const data = await t.context.got.post(`users/authenticate`, {
//     json: { username, password }
//   }).json();
//   t.is(data.status, 401);
// });

// /* Test for paswword reset if user types wrong username
// test('POST /resetpassword reset password with wrong username', async t => {

//   //change to secrets

//   const username = 'dummmmy';

//   const data = await t.context.got.post(`/resetpassword`, {
//         json: { username }
//       }).json();
//   t.is(data.status, 404);
// })*/



// /*Test for paswword change if user types wrong username
// test('POST /changepassword change password with wrong username', async t => {

//   //change to secrets

//   const username = 'dummy';
//   const password = '123456789';

//   const data = await t.context.got.post(`users/changepassword`, {
//         json: { username, password }
//       }).json();
//   t.is(data.status, 404);
// })*/

/*
Test for the response and status code of get dashboards (get)
Returns all the dashboards of a user and then deletes them
*/
test('GET /dashboards returns correct response and status code', async (t) => {
  const token = authToken;
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
  const token = authToken;
  const name = 'dummyDashboard';

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
  returns success=true if dashboard with that name exists
  else it returs status code = 409
*/
test('POST /delete-dashboard returns correct response or status code', async t => {
  const token = authToken;
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
  const token = authToken;
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
  const token = authToken;
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
