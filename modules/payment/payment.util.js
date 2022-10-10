const constants = require("../../constants");
const NotFoundError = require("../error/error.classes/NotFoundError");
const OrderService = require("../order/order.service");

const handlePaymentSuccessEvent = async (checkoutSession) => {
  const orderId = checkoutSession.metadata?.orderId;
  if (
    checkoutSession.payment_status !==
      constants.STRIPE_CHECKOUT_SESSION.PAYMENT_STATUS.PAID ||
    !orderId
  )
    return;

  try {
    const dbOrder = await OrderService.findById(orderId);
    if (!dbOrder) throw new NotFoundError("Order Not Found!");

    dbOrder.status = constants.ORDER.STATUS.CONFIRMED;
    dbOrder.payment.method = constants.PAYMENT.METHODS.ONLINE;
    dbOrder.payment.status = true;

    // update order details
    await OrderService.save(dbOrder);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { handlePaymentSuccessEvent };
