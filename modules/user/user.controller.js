const { StatusCodes } = require("http-status-codes");
const User = require("./user.model");
const Auth = require("../auth/auth.model");
const { startSession } = require("mongoose");
const UserService = require("./user.service");
const UserUtil = require("./user.util");
const AuthService = require("../auth/auth.service");
const BadRequestError = require("../error/error.classes/BadRequestError");

const createUser = async (req, res) => {
  const { password } = req.body;
  const user = new User(req.body);

  // validate password
  if (!password) throw new BadRequestError("Password cannot be empty!");

  // construct auth
  const auth = new Auth();
  auth._id = user.email;
  auth.password = await UserUtil.getEncryptedPassword(password);
  auth.user = user;

  let dbUser = null;

  // start mongoose default session
  const session = await startSession();

  try {
    // start transaction for the session
    session.startTransaction();

    //save the user
    dbUser = await UserService.save(user, session);
    await AuthService.save(auth, session);

    // commit transaction
    await session.commitTransaction();
  } catch (err) {
    // abort transaction
    await session.abortTransaction();
    throw err;
  } finally {
    // end session
    await session.endSession();
  }

  return res
    .status(StatusCodes.CREATED)
    .json({ message: "User created successfully!", obj: dbUser });
};

module.exports = { createUser };
