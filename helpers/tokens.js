"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// Return signed JWT {email, role} from user data

function createToken(user) {
  let payload = {
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };