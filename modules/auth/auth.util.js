const jwt = require("jsonwebtoken");
require("dotenv").config();

const signToken = (user) => {
  const maxAge = 24 * 60 * 60; // 24h

  const tokenBody = {
    _id: user._id,
    email: user.email,
    role: user.role,
    pharmacies: user.pharmacies,
  };

  return jwt.sign(tokenBody, String(process.env.JWT_SECRET), {
    expiresIn: maxAge,
  });
};

module.exports = { signToken };
