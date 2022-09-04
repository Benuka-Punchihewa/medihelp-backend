const express = require("express");
const constants = require("../../constants");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const commonMiddleware = require("../common/common.middleware");

const globalMedicineController = require("./globalMedicine.controller");

// create order
router.post(
  "/",
  authMiddleware.authorize([constants.USER.ROLES.ADMIN]),
  globalMedicineController.createGlobalMedincine
);

module.exports = router;
