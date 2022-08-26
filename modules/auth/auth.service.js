const Auth = require("./auth.model");

const save = async (auth, session) => {
  return await auth.save({ session });
};

const findById = async (id, session) => {
  if (session) return await Auth.findById(id).session(session);
  return await Auth.findById(id);
};

module.exports = { save, findById };
