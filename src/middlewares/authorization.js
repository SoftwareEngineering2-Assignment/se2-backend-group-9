const jwt = require('jsonwebtoken');
const {path, ifElse, isNil, startsWith, slice, identity, pipe} = require('ramda');

const secret = process.env.SERVER_SECRET;

module.exports = (req, res, next) => {
  /**
     * @name authorization
     * @description Middleware that checks a token's presence and validity in a request
     * needs secret as input
    */
  pipe(
    (r) =>
      path(['query', 'token'], r)
          || path(['headers', 'x-access-token'], r)
          || path(['headers', 'authorization'], r),
    
    /**
      * if token in not null and is a Bearer token, then return it sliced
      * else return it as it is.
     */
    ifElse(
      (t) => !isNil(t) && startsWith('Bearer ', t),
      (t) => slice(7, t.length, t).trimLeft(),
      identity
    ),
    /**
      * if token in null it returns error code (403) and token missing message,
      * else call jwt.verify to verify token
     */
    ifElse(
      isNil,
      () =>
        next({
          message: 'Authorization Error: token missing.',
          status: 403
        }),
      (token) =>
        /**
          * if verify returns null error, token is valid and it returns the decoded request,
          * else if error is not null, and its name is TokenExpiredError then return error code (401) and expired message,
          * else return error code (403) and failed to verify token
         */
        jwt.verify(token, secret, (e, d) =>
          ifElse(
            (err) => !isNil(err),
            (er) => {
              if (er.name === 'TokenExpiredError') {
                next({
                  message: 'TokenExpiredError',
                  status: 401,
                });
              }
              next({
                message: 'Authorization Error: Failed to verify token.',
                status: 403
              });
            },
            (_, decoded) => {
              req.decoded = decoded;
              return next();
            }
          )(e, d))
    )
  )(req);
};
