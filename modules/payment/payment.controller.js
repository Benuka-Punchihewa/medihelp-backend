const { StatusCodes } = require("http-status-codes");
const constants = require("../../constants");
const BadRequestError = require("../error/error.classes/BadRequestError");
const NotFoundError = require("../error/error.classes/NotFoundError");
const OrderService = require("../order/order.service");
const PaymentUtil = require("./payment.util");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  const { orderId } = req.params;

  // validate order
  const dbOrder = await OrderService.findById(orderId);
  if (!dbOrder) throw new NotFoundError("Order not found!");

  // validate order status
  if (dbOrder.status === constants.ORDER.STATUS.PENDING)
    throw new BadRequestError("Order has not been approved yet!");
  if (dbOrder.status === constants.ORDER.STATUS.CONFIRMED)
    throw new ConflictError("Order is already confirmed!");
  if (dbOrder.status === constants.ORDER.STATUS.CANCELLED)
    throw new BadRequestError("Order is rejected!");
  if (dbOrder.status === constants.ORDER.STATUS.COMPLETED)
    throw new BadRequestError("Order is already completed!");
  if (
    dbOrder.payment.status === true &&
    dbOrder.payment.method === constants.PAYMENT.METHODS.ONLINE
  )
    throw new BadRequestError("Payment is already done!");
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
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Math.trunc(dbOrder.payment.delivery * 100),
            currency: constants.PAYMENT.PAYMENT_CURRENCY,
          },
          display_name: "Standard Delivery",
          // Delivers between 2-5 business days
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 2,
            },
            maximum: {
              unit: "business_day",
              value: 5,
            },
          },
        },
      },
    ],
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

const ListenForStripeEvents = async (req, res) => {
  console.log("Stripe webhook called");

  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object;
      PaymentUtil.handlePaymentSuccessEvent(checkoutSession);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

module.exports = { createCheckoutSession, ListenForStripeEvents };
