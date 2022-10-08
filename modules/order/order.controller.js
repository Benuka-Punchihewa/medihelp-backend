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
const InternalServerError = require("../error/error.classes/InternalServerError");
const UserService = require("../user/user.service");

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
  const { keyword } = req.query;

  // validate pharmacy
  const dbPharamacy = await PharmacyService.findById(pharmacyId);
  if (!dbPharamacy) throw new NotFoundError("Pharmacy not found!");

  // validate authority
  pharmacyUtil.validatePharmacyAuthority(auth, pharmacyId);

  // prepare query object
  const queryObj = { "pharmacy._id": pharmacyId };
  if (keyword) queryObj._id = { $regex: keyword, $options: "i" };

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
  if (dbOrder.status !== constants.ORDER.STATUS.PENDING)
    throw new BadRequestError("Order is already approved!");

  // validate pharmacy authority
  pharmacyUtil.validatePharmacyAuthority(auth, dbOrder.pharmacy._id.toString());

  let medicinesArr = [];
  let medicineTotalFee = 0;
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
      dbMedicine &&
      medicine.quantity > dbMedicine.stockLevel &&
      medicine.availability === true
    ) {
      throw new ConflictError(
        `Stock for ${medicine.name} has run out! Please mark it as not available!`
      );
    }

    if (medicine.availability === false || !dbMedicine) {
      // should be processed later is exists
      const pMedicineObj = {
        _id: null,
        globalMedicine: {
          _id: dbGlobalMedicine._id,
          name: dbGlobalMedicine.name,
        },
        quantity: medicine.quantity,
        availability: null,
        subTotal: 0,
      };
      medicinesArr.push(pMedicineObj);
      continue;
    }

    // prepare object
    const pMedicineObj = {
      _id: dbMedicine._id,
      globalMedicine: {
        _id: dbGlobalMedicine._id,
        name: dbGlobalMedicine.name,
      },
      quantity: medicine.quantity,
      availability: medicine.availability,
      subTotal: dbMedicine.unitPrice * medicine.quantity,
    };
    medicinesArr.push(pMedicineObj);
    medicineTotalFee += dbMedicine.unitPrice * medicine.quantity;
  }

  // check for items not available in the requested pharmacy
  const isResult = medicinesArr.find(
    (medicine) => medicine.availability === null
  );

  // find suggessions only if item/items not available in the requested pharmacy exists
  if (isResult) {
    /**
     * This call is very expensive and should be called only if neccessary
     */
    // get pharmacies by delivery location
    const sortedPharmacies =
      await pharmacyUtil.getPharmaciesSortedByNearestLocation(
        dbOrder.delivery.location.latitude,
        dbOrder.delivery.location.longitude
      );

    // for smaller medicine lists the below method is less expensive
    // seperate filterations of not available items & then process & then create new Arr is resource hungry for smaller lists
    for (const medicine of medicinesArr) {
      if (medicine.availability === null) {
        for (const pharmacy of sortedPharmacies) {
          const dbMedicineV2 = await MedicineService.findMedicineByPharmacyId(
            pharmacy._id,
            medicine.globalMedicine._id
          );

          if (dbMedicineV2) {
            medicine.suggession = pharmacy;
            break;
          }
        }
      }
    }
  }

  // construct body
  const order = new Order(dbOrder);

  order.status = constants.ORDER.STATUS.REQUIRES_CUSTOMER_CONFIRMATION;
  order.medicines = medicinesArr;
  order.payment.subtotal = medicineTotalFee.toFixed(2);

  /**
   * calculate delivery fee
   */
  // get pharmacy
  const dbPharmacy = await PharmacyService.findById(dbOrder.pharmacy._id);
  const crowDistance = commonUtil.getDistanceBetweenPoints(
    dbOrder.delivery.location.latitude,
    dbOrder.delivery.location.longitude,
    dbPharmacy.location.latitude,
    dbPharmacy.location.longitude
  );
  order.payment.delivery = (
    crowDistance * constants.DELIVERY.CHARGE_PER_KM
  ).toFixed(2);

  order.payment.total = order.payment.delivery + order.payment.subtotal;

  // filter out available medicines to record stock consumption
  const availableMedicines = medicinesArr.filter(
    (medicine) => medicine.availability === true
  );

  // start mongoose default session
  const session = await startSession();

  try {
    // start transaction for the session
    session.startTransaction();

    // reduce stock levels - should increase back if user rejects at customer confirmation
    for (const availableMedicine of availableMedicines) {
      const dbMed = await MedicineService.reduceStockLevels(
        availableMedicine._id,
        availableMedicine.quantity,
        session
      );
      if (!dbMed)
        throw new InternalServerError("Encountered a database error!");
    }

    // update order details
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
    .status(StatusCodes.OK)
    .json({ message: "Order approved successfully!", obj: order });
};

// for customers only
const getOrdersByUserId = async (req, res) => {
  const { pagable } = req.body;
  const { userId } = req.params;
  const { status } = req.query;

  // validate user
  const dbUser = await UserService.findById(userId);
  if (!dbUser) throw new NotFoundError("User not found!");

  // prepare query object
  const queryObj = { "customer._id": userId };
  if (status === constants.ORDER.CUSTOMER_F_STATUS.PENDING)
    queryObj.$or = [
      { status: constants.ORDER.STATUS.PENDING },
      { status: constants.ORDER.STATUS.REQUIRES_CUSTOMER_CONFIRMATION },
    ];
  if (status === constants.ORDER.CUSTOMER_F_STATUS.ONGOING)
    queryObj.status = constants.ORDER.STATUS.CONFIRMED;
  if (status === constants.ORDER.CUSTOMER_F_STATUS.COMPLETED)
    queryObj.status = constants.ORDER.STATUS.COMPLETED;
  if (status === constants.ORDER.CUSTOMER_F_STATUS.CANCELLED)
    queryObj.status = constants.ORDER.STATUS.CANCELLED;

  const result = await OrderService.getOrders(queryObj, pagable);

  return res.status(StatusCodes.OK).json(result);
};

module.exports = {
  createOrder,
  getOrdersByPharmacy,
  approveOrder,
  getOrdersByUserId,
};
