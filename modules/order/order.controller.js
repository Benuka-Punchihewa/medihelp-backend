const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/error.classes/BadRequestError");
const Order = require("./order.model");
const PharmacyService = require("../pharmacy/pharmacy.service");
const NotFoundError = require("../error/error.classes/NotFoundError");
const constants = require("../../constants");
const OrderService = require("./order.service");
const { startSession } = require("mongoose");
const commonService = require("../common/common.service");
const { v4: UUIDV4 } = require("uuid");

const createOrder = async (req, res) => {
  const { auth, stringifiedBody } = req.body;

  // validate image
  if (!req.file)
    throw new BadRequestError("Please provide the prescription sheet!");
  if (req.file.mimetype.split("/")[0] !== "image")
    throw new BadRequestError("Only images are permitted!");

  // validate body
  if (!stringifiedBody) throw new BadRequestError("Bad request body!");

  // parse body
  const parsedBody = JSON.parse(stringifiedBody);

  // validate pharmacy
  const dbPharmacy = await PharmacyService.findById(parsedBody?.pharmacy?._id);
  if (!dbPharmacy) throw new NotFoundError("Pharmacy not found!");

  // construct order body
  const order = new Order(parsedBody);
  order.payment.status = false;
  order.customer._id = auth._id;
  order.pharamcy._id = dbPharmacy._id;
  order.status = constants.ORDER.STATUS.PENDING;

  // upload the image to firebase and get the url
  const filename = `order_${dbPharmacy.registrationNumber}_${UUIDV4() + 1}`;
  order.prescriptionSheet = await commonService.uploadToFirebase(
    req.file,
    filename
  );

  // start mongoose default session
  const session = await startSession();

  try {
    // start transaction for the session
    session.startTransaction();

    // construct order id
    const orderCount =
      await OrderService.getOrderCountOfTheCurrentDayByPharamcy(
        order.pharamcy._id,
        session
      );

    order._id = `Order_${dbPharmacy.registrationNumber}_${orderCount + 1}`;

    // save order
    await OrderService.save(order, session);

    // commit transaction
    await session.commitTransaction();
  } catch (err) {
    // abort transaction
    await session.abortTransaction();
    throw err;
  } finally {
    // end session
    await session.endSession();
  }

  return res
    .status(StatusCodes.CREATED)
    .json({ message: "Order created successfully!", obj: order });
};

module.exports = { createOrder };
