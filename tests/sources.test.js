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

const authToken2 = process.env.AUTHTOKEN2;
const my_user = {
  "username": "dummy2",
  "id": "638e4b3d0618e2216c0ac833",
  "email": "dummy2@gmail.com"
};

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

/*Test for the response and status code of get sources*/
test('GET /sources returns correct response and status code', async (t) => {
  const token = authToken2;
  const { body, statusCode } = await t.context.got(`sources/sources?token=${token}`);
  //console.log(body);
  t.is(statusCode, 200);
  t.assert(body.success);
});

/*
  Test for post request create-source,
  returns correct response if name does not exist, so source is created
  else if name exists returns error
*/
test('POST /create-source returns correct response or status code (409) if exists', async (t) => {
  const token = authToken2;
  const name = 'source2';
  const type = 'type2';
  const url = 'url2';
  const login = 'login2';
  const passcode = 'pass2';
  const vhost = 'vhost2';
  const id = '2'

  const body = await t.context.got.post(`sources/create-source?token=${token}&id=${id}`, {
    json: { name, type, url, login, passcode, vhost }
  }).json();

  if (body.sucess) {
    t.assert(body.success);
  }
  else {
    t.is(body.status, 409);
  }
});

/*
  Test for post request change-source with correct id,
  returns correct response if source with (id) exists and new_name doesn't exist
  else if new_name exists returns 409
*/
test('POST /change-source returns correct response or (409) if source name already exists', async (t) => {

  const token = authToken2;
  const id = '639b0277a43c0dee8d5fb1db' //source1 gets changed
  const name = 'source2'; //using existing name to check error code
  const type = 'new_type';
  const url = 'new_url';
  const login = 'new_login';
  const passcode = 'new_pass';
  const vhost = 'new_vhost';

  const body = await t.context.got.post(`sources/change-source?token=${token}&id=${id}`, {
    json: { id, name, type, url, login, passcode, vhost }
  }).json();

  if (body.success) {
    t.assert(body.success);
  }
  else {
    t.is(body.status, 409)
  }
});

/*
  Test for post request change-source with wrong id,
  returns 409 status code
*/
test('POST /change-source returns (409) if source id is incorrect ', async (t) => {

  const token = authToken2;
  const id = '500b0277a43c0dee8d5fb1db' //using wrong id
  const name = 'new_source';
  const type = 'new_type';
  const url = 'new_url';
  const login = 'new_login';
  const passcode = 'new_pass';
  const vhost = 'new_vhost';

  const body = await t.context.got.post(`sources/change-source?token=${token}&id=${id}`, {
    json: { id, name, type, url, login, passcode, vhost }
  }).json();

  t.is(body.status, 409)
});

/*
  Test for post request delete-source with correct id,
  returns status code 409 if source with (id) not found
*/
test('POST /delete-source returns 409 if source not found', async (t) => {

  const token = authToken2;
  const id = '500b0277a43c0dee8d5fb1db' //using wrong id

  const body = await t.context.got.post(`sources/delete-source?token=${token}`, {
    json: { id }
  }).json();

  t.is(body.status, 409);

});

/*
  Test for post request /source,
  returns success is source is found
*/
test('POST /source returns correct response', async (t) => {

  const name = 'source2'; //wrong source name
  const owner = 'self';
  const user = my_user;

  const body = await t.context.got.post(`sources/source`, {
    json: { name, owner, user }
  }).json();

  t.assert(body.success);
});

/*
  Test for post request /source,
  returns 409 if source not found
*/
test('POST /source returns 409 if source not found', async (t) => {

  const name = 'source999'; //wrong source name
  const owner = 'self';
  const user = my_user;

  const body = await t.context.got.post(`sources/source`, {
    json: { name, owner, user }
  }).json();

  t.is(body.status, 409);
});

/*
  Test for post request /check-sources with correct id,
  returns correct response
*/
test('POST /check-sources returns correct response', async (t) => {

  const token = authToken2;
  const id = '639b0277a43c0dee8d5fb1db'; //changing source: new_source
  const sources = ['new_source', 'source2', 'source3']; //if source (name) doesn't exists, it is created

  const body = await t.context.got.post(`sources/check-sources?token=${token}&id=${id}`, {
    json: { sources }
  }).json();

  t.assert(body.success);
});
