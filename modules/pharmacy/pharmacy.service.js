const Pharmacy = require("./pharmacy.model");

const save = async (pharmacy, session) => {
  return await pharmacy.save({ session });
};

const findById = async (id, session) => {
  if (session) return await Pharmacy.findById(id).session(session);
  return await Pharmacy.findById(id);
};

module.exports = { save, findById };
