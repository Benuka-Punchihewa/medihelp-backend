const { StatusCodes } = require("http-status-codes");
const constants = require("../../constants");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: constants.PAYMENT.PAYMENT_CURRENCY,
          unit_amount: 50 * 100, // in cents
          product_data: {
            name: "Amoxillin",
          },
        },
        quantity: 10,
      },
    ],
    currency: constants.PAYMENT.PAYMENT_CURRENCY,
    metadata: {
      orderId: 123,
    },
    mode: "payment",
    success_url: `${process.env.FRONTEND_BASE_URL}?success=true`,
    cancel_url: `${process.env.FRONTEND_BASE_URL}?canceled=true`,
  });

  return res
    .status(StatusCodes.SEE_OTHER)
    .json({ message: "Go to the provided URL", url: session.url });
};

module.exports = { createCheckoutSession };
