const express = require("express");
const constants = require("../../constants");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const commonMiddleware = require("../common/common.middleware");

const medicineController = require("./medicine.controller");

// create order
router.post(
  "/pharmacies/:pharmacyId",
  authMiddleware.authorize([
    constants.USER.ROLES.ADMIN,
    constants.USER.ROLES.PHARMACY_OWNER,
  ]),
  medicineController.createMedicine
);

router.get(
  "/pharmacies/:pharmacyId",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
  ]),
  commonMiddleware.paginate,
  medicineController.getAllMedicines
  );

module.exports = router;
