const GlobalMedicine = require("./globalMedicine.model");

const save = async (globalMedicine, session) => {
  return await globalMedicine.save({ session });
};

const findById = async (id, session) => {
  if (session) return await GlobalMedicine.findById(id).session(session);
  return await GlobalMedicine.findById(id);
};

const getGlobalMedicines = async (queryObj, pagableObj) => {
  const { page, limit, orderBy } = pagableObj;

  const content = await GlobalMedicine.find(queryObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: orderBy })
    .exec();

  const totalElements = await GlobalMedicine.countDocuments(queryObj);

  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / limit),
  };
};

//delete
const deleteOne = async (id, session) => {
  if (session)
    return await GlobalMedicine.deleteOne({ _id: id }).session(session);
  return await GlobalMedicine.deleteOne(id);
};

module.exports = { save, findById, getGlobalMedicines, deleteOne };
