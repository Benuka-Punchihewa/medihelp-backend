const express = require("express");
const constants = require("../../constants");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const PaymentController = require("./payment.controller");

// create order
router.post(
  "/checkout-session/orders/:orderId",
  authMiddleware.authorize([
    constants.USER.ROLES.CUSTOMER,
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
  ]),
  PaymentController.createCheckoutSession
);

router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  PaymentController.ListenForStripeEvents
);

module.exports = router;
