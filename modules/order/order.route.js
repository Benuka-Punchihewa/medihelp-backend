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
  "/:orderId",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
  ]),
  orderController.approveOrder
);

module.exports = router;
