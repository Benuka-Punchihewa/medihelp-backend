const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/error.classes/BadRequestError");
const NotFoundError = require("../error/error.classes/NotFoundError");
const authService = require("./auth.service");
const authUtil = require("./auth.util");
const bcrypt = require("bcryptjs");
const UnauthorizedError = require("../error/error.classes/UnauthorizedError");

const login = async (req, res) => {
  const { email, password } = req.body;

  // validations
  if (!password) throw new BadRequestError("Password is required!");

  const dbAuth = await authService.findById(email);
  if (!dbAuth) throw new NotFoundError("User not found!");

  //compare the passwords
  const passwordCompare = await bcrypt.compare(
    password,
    String(dbAuth.password)
  );
  if (!passwordCompare) throw new UnauthorizedError("Bad Credentials!");

  // populate user
  const dbPopulatedAuth = await dbAuth.populate("user");

  // sign token
  const token = authUtil.signToken(dbPopulatedAuth.user);

  return res
    .status(StatusCodes.OK)
    .json({ message: "Login successfull!", user: dbPopulatedAuth.user, token });
};

module.exports = { login };
