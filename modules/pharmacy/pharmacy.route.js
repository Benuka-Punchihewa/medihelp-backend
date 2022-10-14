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

//get nearest pharmacies
router.get(
  "/v/customer",
  commonMiddleware.paginate,
  pharmacyController.getPharmaciesByNearestLocation
);

//update pharmacy
router.patch(
  "/:pharmacyId",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN]),
  pharmacyController.updatePharmacy
);

//delete pharmacy
router.delete(
  "/:pharmacyId",
  authMiddleware.authorize([
    constants.USER.ROLES.PHARMACY_OWNER,
    constants.USER.ROLES.ADMIN]),
  pharmacyController.deletePharmacy
);


module.exports = router;
