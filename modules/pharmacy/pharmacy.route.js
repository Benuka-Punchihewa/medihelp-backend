const express = require("express");
const constants = require("../../constants");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");

const pharmacyController = require("./pharamacy.controller");

router.post(
  "/",
  authMiddleware.authorize([constants.USER.ROLES.PHARMACY_OWNER]),
  pharmacyController.createPharmacy
);

module.exports = router;
