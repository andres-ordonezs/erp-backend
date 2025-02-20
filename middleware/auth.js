"use strict";

/** Convenience middleware to handle common auth cases in routes. */
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (This will include ...)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be superAdmin.
 *
 * If not, raises Unauthorized.
 */
function ensureSuperAdmin(req, res, next) {
  if (res.locals.user?.role === 'super_admin') return next();
  throw new UnauthorizedError();
}


/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */
function ensureLoggedIn(req, res, next) {
  if (res.locals.user?.email) return next();
  throw new UnauthorizedError();
}

/** Middleware to ensure the user is correct (matches the email in the request params).
 *
 * If the emails don't match, raises Unauthorized.
 */
async function ensureCorrectUser(req, res, next) {
  const currentUser = res.locals.user?.email;

  if (
    currentUser && (currentUser === req.params.email))
    return next();
  throw new UnauthorizedError();
}

/** Middleware to allow either super admin or correct user.
 *
 * If neither condition is met, raises Unauthorized.
 */
function ensureSuperAdminOrCorrectUser(req, res, next) {
  const currentUser = res.locals.user?.email;
  const isSuperAdmin = res.locals.user?.role === 'super_admin';

  if (isSuperAdmin || (currentUser && currentUser === req.params.email)) {
    return next();
  }

  throw new UnauthorizedError();
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureSuperAdmin,
  ensureSuperAdminOrCorrectUser
};