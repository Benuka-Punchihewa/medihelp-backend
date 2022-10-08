const { StatusCodes } = require("http-status-codes");
const constants = require("../../constants");
const BadRequestError = require("../error/error.classes/BadRequestError");
const NotFoundError = require("../error/error.classes/NotFoundError");
const OrderService = require("../order/order.service");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  const { orderId } = req.params;

  // validate order
  const dbOrder = await OrderService.findById(orderId);
  if (!dbOrder) throw new NotFoundError("Order not found!");
  if (dbOrder.status === constants.ORDER.STATUS.PENDING)
    throw new BadRequestError("Order has not been approved by the pharmacy!");
  if (
    dbOrder.payment.status === true &&
    dbOrder.payment.method === constants.PAYMENT.METHODS.ONLINE
  )
    throw new BadRequestError("Payment has been already done");
  if (dbOrder.payment.method === constants.PAYMENT.METHODS.CASH_ON_DELIVERY)
    throw new BadRequestError(
      "Cannot make online payments for cash on delivery orders!"
    );

  // prepare line items
  const lineItems = [];
  for (const medicine of dbOrder.medicines) {
    if (medicine.availability) {
      lineItems.push({
        price_data: {
          currency: constants.PAYMENT.PAYMENT_CURRENCY,
          unit_amount: Math.trunc(
            (medicine.subTotal / medicine.quantity) * 100
          ), // in cents
          product_data: {
            name: medicine?.globalMedicine?.name,
          },
        },
        quantity: Math.trunc(medicine.quantity),
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    currency: constants.PAYMENT.PAYMENT_CURRENCY,
    metadata: {
      orderId: dbOrder._id,
    },
    mode: "payment",
    success_url: `${process.env.FRONTEND_BASE_URL}/my-orders?success=true&orderId=${dbOrder._id}`,
    cancel_url: `${process.env.FRONTEND_BASE_URL}/my-orders?canceled=true&orderId=${dbOrder._id}`,
  });

  return res
    .status(StatusCodes.OK)
    .json({ message: "Go to the provided URL", url: session.url });
};

module.exports = { createCheckoutSession };
