const express = require("express");
const constants = require("../../constants");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const commonMiddleware = require("../common/common.middleware");

const pharmacyController = require("./pharamacy.controller");

// create pharmacy
router.post(
  "/",
  authMiddleware.authorize([constants.USER.ROLES.PHARMACY_OWNER]),
  pharmacyController.createPharmacy
);

// get all pharmacy
router.get(
"/",
authMiddleware.authorize([
  constants.USER.ROLES.PHARMACY_OWNER,
  constants.USER.ROLES.ADMIN,
]),
commonMiddleware.paginate,
pharmacyController.findAllPharmacyPagination
);

// get pharmacy id
router.get(
  "/:pharmacyId",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN,
    constants.USER.ROLES.CUSTOMER,
  ]),
  pharmacyController.getPharmacyById
);

module.exports = router;
