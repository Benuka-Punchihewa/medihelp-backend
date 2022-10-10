const Pharmacy = require("./pharmacy.model");

const save = async (pharmacy, session) => {
  return await pharmacy.save({ session });
};

const findById = async (id, session) => {
  if (session) return await Pharmacy.findById(id).session(session);
  return await Pharmacy.findById(id);
};

const findAllPharmacyPagination = async (queryobj, pagableobj) => {
  const { page, limit, orderBy } = pagableobj;

  const content = await Pharmacy.find(queryobj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: orderBy })
    .exec();

  const totalElements = await Pharmacy.countDocuments(queryobj);

  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / limit),
  };
};

const getAll = async () => {
  return await Pharmacy.find({});
};

module.exports = { save, findById, findAllPharmacyPagination, getAll };
