const constants = require("../../constants");
const Order = require("./order.model");

const save = async (order, session) => {
  return await order.save({ session });
};

const findById = async (id, session) => {
  if (session) return await Order.findById(id).session(session);
  return await Order.findById(id);
};

const findOrderCountOfTheCurrentDayByPharamcy = async (pharmacyId, session) => {
  const today = new Date().toISOString().split("T")[0] + "T00:00:00.000";
  return await Order.find(
    { "pharamcy._id": pharmacyId, createdAt: { $gte: today } },
    { session }
  ).countDocuments();
};

const findOrders = async (queryObj, pagableObj) => {
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

const findCount = async (queryObj, session) => {
  if (session) return await Order.countDocuments(queryObj).session(session);
  return await Order.countDocuments(queryObj);
};

const findOrdersNoPagination = async (queryObj, session) => {
  if (session) return await Order.find(queryObj).session(session);
  return await Order.find(queryObj);
};

const findOrderCountByPharmacy = async () => {
  return await Order.aggregate([
    { $group: { _id: "$pharmacy._id", orders: { $push: "$_id" } } },
    {
      $lookup: {
        from: "pharmacies",
        localField: "_id",
        foreignField: "_id",
        as: "fromItems",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$fromItems", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $project: { _id: 1, name: 1, orderCount: { $size: "$orders" } },
    },
  ]);
};

module.exports = {
  save,
  findById,
  getOrderCountOfTheCurrentDayByPharamcy:
    findOrderCountOfTheCurrentDayByPharamcy,
  getOrders: findOrders,
  findCount,
  findOrdersNoPagination,
  findOrderCountByPharmacy,
};
