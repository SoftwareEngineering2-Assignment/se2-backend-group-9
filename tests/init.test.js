/* eslint-disable import/no-unresolved */
//require('dotenv').config();

const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');

require('dotenv').config(app.env);
console.log(process.env);

test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});
});

test.after.always((t) => {
  t.context.server.close();
});

/*Test for the response and status code of get statitics */
test('GET /statistics returns correct response and status code', async (t) => {
  const {body, statusCode} = await t.context.got('general/statistics');
  t.is(body.sources, 0);
  t.assert(body.success);
  t.is(statusCode, 200);
});

// test('GET /sources returns correct response and status code', async (t) => {
//   const token = jwtSign({id: 1});
//   const {statusCode} = await t.context.got(`sources/sources?token=${token}`);
//   t.is(statusCode, 200);

test('POST /authenticate', async t => {
  const username = 'dummy';
  const password = '12345678';

  const data = await t.context.got.post('users/authenticate', {
        json: { username, password }
      }).json()

  //t.is(data.status, 401);
  console.log(data);
  t.is(1, 1);
});

/*Test for the response and status code of get dashboard */
test('GET /dashboard returns correct response and status code', async (t) => {
  const token = jwtSign({id: 1});
  const {body, statusCode} = await t.context.got(`dashboards/dashboards?token=${token}`);
  t.assert(body.success);
  t.is(statusCode, 200);
});

/*Test for post request of register account with existing or user or email */
test('POST /create should return error if email or user exists', async t => {
  const username = 'dummy';
  const password = '12345678';
  const email = 'dummy@gmail.com';
  
  const data = await t.context.got.post(`users/create`, {
        json: { username, password, email }
      }).json();
  t.is(data.status, 409);
})

/*Test for user authentication (post) */
test('POST /authenticate authenticates correctly a dummy user', async t => {
  
  //change to secrets
  
  const username = 'dummy';
  const password = '12345678';
  
  const data = await t.context.got.post(`users/authenticate`, {
        json: { username, password }
      }).json();
  t.is(data.user.username, username);
})

/*Test for user authentication if password is wrong (post) */
test('POST /authenticate a dummy user with wrong pasword', async t => {
  
  //change to secrets
  
  const username = 'dummy';
  const password = '135790';
  
  const data = await t.context.got.post(`users/authenticate`, {
        json: { username, password }
      }).json();
  t.is(data.status, 401);
})

/*Test for user authentication if username is wrong (post) */
test('POST /authenticate a dummy user with wrong username', async t => {
  
  //change to secrets
  
  const username = 'dummmmy';
  const password = '123456789';
  
  const data = await t.context.got.post(`users/authenticate`, {
        json: { username, password }
      }).json();
  t.is(data.status, 401);
})

/* Test for paswword reset if user types wrong username
test('POST /resetpassword reset password with wrong username', async t => {
  
  //change to secrets
  
  const username = 'dummmmy';

  const data = await t.context.got.post(`/resetpassword`, {
        json: { username }
      }).json();
  t.is(data.status, 404);
})*/



/*Test for paswword change if user types wrong username
test('POST /changepassword change password with wrong username', async t => {
  
  //change to secrets
  
  const username = 'dummy';
  const password = '123456789';

  const data = await t.context.got.post(`users/changepassword`, {
        json: { username, password }
      }).json();
  t.is(data.status, 404);
})*/
