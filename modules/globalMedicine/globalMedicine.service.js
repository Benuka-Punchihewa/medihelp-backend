const GlobalMedicine = require("./globalMedicine.model");

const save = async (globalMedicine, session) => {
  return await globalMedicine.save({ session });
};

module.exports = { save };
