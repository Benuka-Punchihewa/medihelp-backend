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
const pharmacyUtil = require("../pharmacy/pharmacy.util");
const commonUtil = require("../common/common.util");

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
  order.pharmacy._id = dbPharmacy._id;
  order.status = constants.ORDER.STATUS.PENDING;

  // start mongoose default session
  const session = await startSession();

  try {
    // start transaction for the session
    session.startTransaction();

    // construct order id
    const orderCount =
      await OrderService.getOrderCountOfTheCurrentDayByPharamcy(
        order.pharmacy._id,
        session
      );

    order._id = `Order_${dbPharmacy.registrationNumber}_${
      new Date().toISOString().split("T")[0]
    }_${orderCount + 1}`;

    // generate firebase storage url
    order.prescriptionSheet = commonUtil.generateFirebaseStorageURL(order._id);

    // save order
    await OrderService.save(order, session);

    // upload the image to firebase
    await commonService.uploadToFirebase(req.file, order._id);

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

const getOrdersByPharmacy = async (req, res) => {
  const { auth, pagable } = req.body;
  const { pharmacyId } = req.params;

  // validate pharmacy
  const dbPharamacy = await PharmacyService.findById(pharmacyId);
  if (!dbPharamacy) throw new NotFoundError("Pharmacy not found!");

  // validate authority
  pharmacyUtil.validatePharmacyAuthority(auth, pharmacyId);

  const queryObj = { "pharmacy._id": pharmacyId };
  const result = await OrderService.getOrders(queryObj, pagable);

  return res.status(StatusCodes.OK).json(result);
};

module.exports = { createOrder, getOrdersByPharmacy };
