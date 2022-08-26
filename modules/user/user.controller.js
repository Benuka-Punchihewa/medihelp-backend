const { StatusCodes } = require("http-status-codes");

const createUser = async (req, res) => {
  return res
    .status(StatusCodes.CREATED)
    .json({ message: "User created successfully!", user: null });
};

module.exports = { createUser };
