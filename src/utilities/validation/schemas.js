const { isNil } = require('ramda');

const yup = require('yup');
const { min } = require('./constants');

// Define a Yup schema for email
const email = yup
  .string()
  .lowercase()
  .trim()
  .email();

// Define a Yup schema for username
const username = yup
  .string()
  .trim();

// Define a Yup schema for password
const password = yup
  .string()
  .trim()
  .min(min);

// Define a Yup schema for a request object with a required username
const request = yup.object().shape({ username: username.required() });

// Define a Yup schema for an authenticate object with required username and password
const authenticate = yup.object().shape({
  username: username.required(),
  password: password.required()
});

// Define a Yup schema for a register object with required email, password, and username
const register = yup.object().shape({
  email: email.required(),
  password: password.required(),
  username: username.required()
});

// Define a Yup schema for an update object with username and password optional
const update = yup.object().shape({
  username,
  password
}).test({
  message: 'Missing parameters',
  test: ({ username: u, password: p }) => !(isNil(u) && isNil(p))
});

// Define a Yup schema for a change object with a required password
const change = yup.object().shape({ password: password.required() });

module.exports = {
  authenticate, register, request, change, update
};
