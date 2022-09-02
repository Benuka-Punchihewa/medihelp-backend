const express = require("express");
const constants = require("../../constants");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const commonMiddleware = require("../common/common.middleware");

const orderController = require("./order.controller");

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

module.exports = router;
