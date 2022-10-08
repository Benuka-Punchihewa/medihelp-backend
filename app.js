const express = require("express");
const cors = require("cors");
const commonConfig = require("./modules/common/common.config");
const constants = require("./constants");
require("dotenv").config();
require("express-async-errors");
const errorHandlerMiddleware = require("./modules/error/error.middleware");
const NotFoundError = require("./modules/error/error.classes/NotFoundError");

// import routes
const userRoutes = require("./modules/user/user.route");
const authRoutes = require("./modules/auth/auth.route");
const pharamacyRoutes = require("./modules/pharmacy/pharmacy.route");
const orderRoutes = require("./modules/order/order.route");
const globalMedicineRoutes = require("./modules/globalMedicine/globalMedicine.route");
const medicineRoutes = require("./modules/medicine/medicine.route");
const paymentRoutes = require("./modules/payment/payment.route");

const app = express();

app.use(cors());

// Use parsers only for non-webhook routes
app.use((req, res, next) => {
  if (
    req.originalUrl === constants.API.PREFIX.concat("/payments/stripe-webhook")
  ) {
    next();
  } else {
    express.json()(req, res, next);
    app.use(express.urlencoded({ extended: true }));
  }
});

// define routes
app.use(constants.API.PREFIX.concat("/users"), userRoutes);
app.use(constants.API.PREFIX.concat("/auth"), authRoutes);
app.use(constants.API.PREFIX.concat("/pharmacies"), pharamacyRoutes);
app.use(constants.API.PREFIX.concat("/orders"), orderRoutes);
app.use(constants.API.PREFIX.concat("/global-medicines"), globalMedicineRoutes);
app.use(constants.API.PREFIX.concat("/medicines"), medicineRoutes);
app.use(constants.API.PREFIX.concat("/payments"), paymentRoutes);

// not found route
app.use((req, res, next) => {
  throw new NotFoundError("API endpoint not found!");
});

// error handler middleware
app.use(errorHandlerMiddleware);

const start = async () => {
  const port = process.env.PORT || 5001;
  try {
    await commonConfig.connectDB();
    app.listen(port, () => {
      console.log(`SERVER IS LISTENING ON PORT ${port}...`);
    });
  } catch (err) {
    console.error(err);
  }
};

start();
