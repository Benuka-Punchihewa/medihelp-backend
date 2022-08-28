const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");

const userController = require("./user.controller");

router.post("/", userController.createUser);

module.exports = router;
