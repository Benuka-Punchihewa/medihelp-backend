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

const findById = async (id, session) => {
  if (session) return await Medicine.findById(id).session(session);
  return await Medicine.findById(id);
};

const reduceStockLevels = async (id, consumption, session) => {
  return await Medicine.findByIdAndUpdate(
    id,
    { $inc: { stockLevel: -consumption } },
    {
      session: session,
      new: true,
      runValidators: true,
    }
  );
};

module.exports = {
  save,
  findMedicineByPharmacyId,
  findById,
  reduceStockLevels,
};
