const Medicine = require("./medicine.model");

const save = async (medicine, session) => {
  return await medicine.save({ session });
};

const findMedicineByPharmacyId = async (
  pharmacyId,
  globalMedicineId,
  session
) => {
  if (session)
    return await Medicine.findOne({
      "pharmacy._id": pharmacyId,
      "global._id": globalMedicineId,
    }).session(session);
  return await Medicine.findOne({
    "pharmacy._id": pharmacyId,
    "global._id": globalMedicineId,
  });
};

module.exports = { save, findMedicineByPharmacyId };
