const User = require("./user.model");

const save = async (user, session) => {
  return await user.save({ session });
};

const findById = async (id, session) => {
  if (session) return await User.findById(id).session(session);
  return await User.findById(id);
};

module.exports = { save, findById };
