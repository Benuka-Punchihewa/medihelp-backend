const Order = require("./order.model");

const save = async (order, session) => {
  return await order.save({ session });
};

const findById = async (id, session) => {
  if (session) return await Order.findById(id).session(session);
  return await Order.findById(id);
};

module.exports = { save, findById };
