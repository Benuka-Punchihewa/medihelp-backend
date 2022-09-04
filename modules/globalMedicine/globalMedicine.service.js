const GlobalMedicine = require("./globalMedicine.model");

const save = async (globalMedicine, session) => {
  return await globalMedicine.save({ session });
};

const findById = async (id, session) => {
  if (session) return await GlobalMedicine.findById(id).session(session);
  return await GlobalMedicine.findById(id);
};

module.exports = { save, findById };
