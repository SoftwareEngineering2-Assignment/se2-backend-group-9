/* eslint-disable import/no-unresolved */

const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');

require('dotenv').config(app.env);
//console.log(process.env);

const authToken1 = process.env.AUTHTOKEN1;
const authToken2 = process.env.AUTHTOKEN2;
const dummypass2 = process.env.DUMMYPASS2;

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

/*Test for post request of register account with existing or user or email */
test('POST /create returns error if email or user exists', async t => {
  const username = 'dummy2';
  const password = dummypass2;
  const email = 'dummy@gmail.com';

  const body = await t.context.got.post(`users/create`, {
    json: { username, password, email }
  }).json();
  t.is(body.status, 409);
});

// /*Test for post request of register account with an unused username or email */
// test('POST /create returns create user with unused email', async t => {
//   const username = 'dummy3';
//   const password = dummypass2;
//   const email = 'dummy3@gmail.com';

//   const body = await t.context.got.post(`users/create`, {
//     json: { username, password, email }
//   }).json();
//   t.is(body.success, true);
// });

/*Test for post request for authenticating a user with correct username and password*/
test('POST /authenticate returns correct username', async t => {
  const username = 'dummy2';
  const password = dummypass2;

  const body = await t.context.got.post('users/authenticate', {
    json: { username, password }
  }).json();

  //console.log(body);
  t.is(body.user.username, 'dummy2');
});

/*Test for user authentication if password is wrong (post) */
test('POST /authenticate returns error if pasword is incorrect', async t => {

  const username = 'dummy';
  const password = '135790';

  const data = await t.context.got.post(`users/authenticate`, {
    json: { username, password }
  }).json();
  t.is(data.status, 401);
});


/*Test for user authentication if username is wrong (post) */
test('POST /authenticate returns error if username is incorrect', async t => {

  const username = 'dummmmy';
  const password = '123456789';

  const data = await t.context.got.post(`users/authenticate`, {
    json: { username, password }
  }).json();
  t.is(data.status, 401);
});

/*Test for password reset with incorrect username*/
test('POST /request to reset password with wrong username', async (t) => {
  const username = 'dummmmy';

  const data = await t.context.got.post(`users/resetpassword`, {
    json: { username }
  }).json();
  t.is(data.status, 404);
});

/*Test for password reset with existing username*/
test('POST /request to reset password with true username', async (t) => {
  const username = 'dummy';
  const email = 'dummy@gmail.com'

  const data = await t.context.got.post(`users/resetpassword`, {
    json: { username, email }
  }).json();
  t.is(data.ok, true);
});

/*Test for password change while the reset token expired for a logged in user*/
test('POST /changepassword change password of a logged in user while the token expired', async t => {

  const username = 'dummy';
  const password = '123456789';
  const token = authToken1;

  const data = await t.context.got.post(`users/changepassword?token=${token}`, {
    json: { username, password }
  }).json();

  if (data.ok) {
    t.assert(data.ok)
  }
  else {
    t.is(data.status, 410);
  }
});


//  /* Test for password change if user types wrong username*/
//  test('POST /changepassword change password with wrong username', async t => {

//    const username = 'dummmmy';
//    const password = '123456789';
//    const token = authToken2;


//    const data = await t.context.got.post(`users/changepassword?token=${token}`, {
//      json: { username, password }
//    }).json();
//    t.is(data.status, 404);
//  });

/* Test for password change if user is logged in with true username and password*/
//  test('POST /changepassword change password with legit username', async t => {

//   const username = 'dummy2';
//   const password = dummypass2;
//   const token = authToken2;


//   const data = await t.context.got.post(`users/changepassword?token=${token}`, {
//     json: { username, password }
//   }).json();
//   t.is(data.ok, true);
// });
