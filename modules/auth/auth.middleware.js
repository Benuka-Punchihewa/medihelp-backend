const jwt = require("jsonwebtoken");
const authUtil = require("./auth.util");
const UnauthorizedError = require("../error/error.classes/UnauthorizedError");
const ForbiddenError = require("../error/error.classes/ForbiddenError");
const constants = require("../../constants");
require("dotenv").config();

const authorize = (roleArr) => {
  if (!roleArr) roleArr = [];
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication invalid!");
    }

    const token = authUtil.extractToken(authHeader);

    if (token) {
      let payload = null;

      // vertify token
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err.name === "TokenExpiredError")
          throw new UnauthorizedError("Your session is expired!");
        return next(
          new UnauthorizedError(`You're unauthorized to access this resource!`)
        );
      }

      // role validation
      if (
        !roleArr.includes(payload.role) &&
        payload.role !== constants.USER.ROLES.ADMIN
      )
        return next(
          new ForbiddenError(`You're unauthorized to access this resource!!`)
        );

      // add auth object to req.body
      req.body["auth"] = payload;
      return next();
    } else {
      return next(
        new UnauthorizedError(`You're unauthorized to access this resource!`)
      );
    }
  };
};

module.exports = { authorize };
