const express = require("express");
const constants = require("../../constants");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const commonMiddleware = require("../common/common.middleware");

const orderController = require("./order.controller");

// create order
router.post(
  "/",
  commonMiddleware.multerUploader.single("image"),
  authMiddleware.authorize([
    constants.USER.ROLES.CUSTOMER,
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
  ]),
  orderController.createOrder
);

// get orders by pharmacy id
router.get(
  "/pharmacies/:pharmacyId",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
  ]),
  commonMiddleware.paginate,
  orderController.getOrdersByPharmacy
);

// approve order
router.patch(
  "/:orderId/approve",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
  ]),
  orderController.approveOrder
);

// get orders by user id - FOR CUSTOMERS ONLY
router.get(
  "/",
  authMiddleware.authorize([]),
  commonMiddleware.paginate,
  orderController.getOrdersByUserId
);

// confirm order - FOR CUSTOMERS ONLY
router.patch(
  "/:orderId/confirm",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
    constants.USER.ROLES.CUSTOMER,
  ]),
  orderController.confirmOrder
);

// reject order
router.patch(
  "/:orderId/reject",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
    constants.USER.ROLES.CUSTOMER,
  ]),
  orderController.rejectOrder
);

// complete order
router.patch(
  "/:orderId/complete",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
  ]),
  orderController.completeOrder
);

router.delete(
  "/:orderId/remove",
  authMiddleware.authorize([]),
  orderController.hideOrder
);

module.exports = router;
