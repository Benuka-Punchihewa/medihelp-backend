const express = require("express");
const constants = require("../../constants");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const commonMiddleware = require("../common/common.middleware");

const globalMedicineController = require("./globalMedicine.controller");

// create medicine
router.post(
  "/",
  authMiddleware.authorize([constants.USER.ROLES.ADMIN]),
  globalMedicineController.createGlobalMedincine
);

// get global medicines
router.get(
  "/",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
    constants.USER.ROLES.CUSTOMER,
  ]),
  commonMiddleware.paginate,
  globalMedicineController.getGlobalMedicines
);

// update global medicines
router.patch(
  "/:globalMedicineId",
  authMiddleware.authorize([constants.USER.ROLES.ADMIN]),
  globalMedicineController.updateGlobalMedicine
);

//delete
router.delete(
  "/:globalMedicineId",
  authMiddleware.authorize([constants.USER.ROLES.ADMIN]),
  globalMedicineController.deleteGlobalMedicine
);

module.exports = router;
