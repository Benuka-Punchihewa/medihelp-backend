const User = require("./user.model");

const save = async (user, session) => {
  return await user.save({ session });
};

module.exports = { save };
