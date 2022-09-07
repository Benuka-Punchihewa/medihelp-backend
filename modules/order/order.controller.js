const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/error.classes/BadRequestError");
const Order = require("./order.model");
const PharmacyService = require("../pharmacy/pharmacy.service");
const NotFoundError = require("../error/error.classes/NotFoundError");
const constants = require("../../constants");
const OrderService = require("./order.service");
const { startSession } = require("mongoose");
const commonService = require("../common/common.service");
const pharmacyUtil = require("../pharmacy/pharmacy.util");
const commonUtil = require("../common/common.util");
const MedicineService = require("../medicine/medicine.service");
const ConflictError = require("../error/error.classes/ConflictError");
const GlobalMedicineService = require("../globalMedicine/globalMedicine.service");

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

const approveOrder = async (req, res) => {
  const { orderId } = req.params;
  const { medicines, auth } = req.body;

  // validate medicines
  if (!medicines) throw new BadRequestError("Medicines list is required!");
  if (!(medicines instanceof Array))
    throw new BadRequestError("Medicines should be sent in an Array!");

  // validate order
  const dbOrder = await OrderService.findById(orderId);
  if (!dbOrder) throw new NotFoundError("Order not found!");

  // validate pharmacy authority
  pharmacyUtil.validatePharmacyAuthority(auth, dbOrder.pharmacy._id);

  let medicinesArr = [];
  // process medicines
  for (const medicine of medicines) {
    // validate medicine id & quantity values
    if (
      !medicine?.globalMedicine?._id ||
      !medicine.quantity ||
      !medicine.name ||
      medicine.availability === undefined
    )
      throw new BadRequestError("Invalid data in the medicines list!");

    // validate medicine quantity
    if (typeof medicine.quantity !== "number")
      throw new BadRequestError(
        `Quantity of medicine, ${medicine.name} should be a number!`
      );

    // validate global medicine
    const dbGlobalMedicine = await GlobalMedicineService.findById(
      medicine?.globalMedicine?._id
    );
    if (!dbGlobalMedicine)
      throw new NotFoundError(`Medicine, ${medicine.name} not found!`);

    const dbMedicine = await MedicineService.findMedicineByPharmacyId(
      dbOrder.pharmacy._id,
      dbGlobalMedicine._id
    );
    // validate medicine availability in pharmacy level
    // report for items marked as available but not available
    if (
      medicine.quantity > dbMedicine.stockLevel &&
      medicine.availability === true
    ) {
      throw new ConflictError(
        `Stock for ${medicine.name} has run out! Please mark it as not available!`
      );
    }

    // find suggessions for items with availability marked as false
    if (medicine.availability === false) {
      // TODO: Write nearest pharmacy suggession logic here.

      const pMedicineObj = {
        _id: null,
        globalMedicine: {
          _id: dbGlobalMedicine._id,
          name: dbGlobalMedicine.name,
        },
        quantity: medicine.quantity,
        availability: null,
        subTotal: 0,
        suggession: {
          pharmacy: {
            _id: "pharmacy id",
          },
        },
      };
      medicinesArr.push(pMedicineObj);
      continue;
    }

    // prepare object
    const pMedicineObj = {
      _id: dbMedicine.id,
      globalMedicine: {
        _id: dbGlobalMedicine._id,
        name: dbGlobalMedicine.name,
      },
      quantity: medicine.quantity,
      availability: medicine.availability,
      subTotal: dbMedicine.unitPrice * medicine.quantity,
    };
    medicinesArr.push(pMedicineObj);
  }

  console.log(medicinesArr);

  return res
    .status(StatusCodes.CREATED)
    .json({ message: "Order approved successfully!", obj: null });
};

module.exports = { createOrder, getOrdersByPharmacy, approveOrder };
