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

const getAllMedicines = async (queryObj, pagableObj) => {
  const { page, limit, orderBy } = pagableObj;

  const content = await Medicine.find(queryObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: orderBy })
    .exec();

  const totalElements = await Medicine.countDocuments(queryObj);

  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / limit),
  };
};

module.exports = {
  save,
  findMedicineByPharmacyId,
  findById,
  reduceStockLevels,
  getAllMedicines,
};
