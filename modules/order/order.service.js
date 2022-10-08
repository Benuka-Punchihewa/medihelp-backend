const Order = require("./order.model");

const save = async (order, session) => {
  return await order.save({ session });
};

const findById = async (id, session) => {
  if (session) return await Order.findById(id).session(session);
  return await Order.findById(id);
};

const getOrderCountOfTheCurrentDayByPharamcy = async (pharmacyId, session) => {
  const today = new Date().toISOString().split("T")[0] + "T00:00:00.000";
  return await Order.find(
    { "pharamcy._id": pharmacyId, createdAt: { $gte: today } },
    { session }
  ).countDocuments();
};

const getOrders = async (queryObj, pagableObj) => {
  const { page, limit, orderBy } = pagableObj;

  const content = await Order.find(queryObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ updatedAt: orderBy })
    .exec();

  const totalElements = await Order.countDocuments(queryObj);

  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / limit),
  };
};

module.exports = {
  save,
  findById,
  getOrderCountOfTheCurrentDayByPharamcy,
  getOrders,
};
