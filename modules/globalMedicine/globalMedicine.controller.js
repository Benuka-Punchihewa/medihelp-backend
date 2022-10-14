const { StatusCodes } = require("http-status-codes");
const GlobalMedicine = require("./globalMedicine.model");
const GlobalMedicineService = require("./globalMedicine.service");
const { startSession } = require("mongoose");
const MedicineService = require("../medicine/medicine.service");
const ConflictError = require("../error/error.classes/ConflictError");
const NotFoundError = require("../error/error.classes/NotFoundError");

const createGlobalMedincine = async (req, res) => {
  const globalMedicine = new GlobalMedicine(req.body);

  await GlobalMedicineService.save(globalMedicine);

  return res.status(StatusCodes.CREATED).json({
    message: "Global Medicine created successfully!",
    obj: globalMedicine,
  });
};

const getGlobalMedicines = async (req, res) => {
  const { pagable } = req.body;
  const { keyword } = req.query;

  const queryObj = {};
  if (keyword) queryObj.name = { $regex: keyword, $options: "i" };

  const result = await GlobalMedicineService.getGlobalMedicines(
    queryObj,
    pagable
  );

  return res.status(StatusCodes.OK).json(result);
};

//update
const updateGlobalMedicine = async (req, res) => {
  const { globalMedicineId } = req.params;
  const { name, strength, brand, manufacturer, type } = req.body;

  // validate global medicines
  const dbGlobalMedicine = await GlobalMedicineService.findById(
    globalMedicineId
  );
  if (!dbGlobalMedicine) throw new NotFoundError("Global Medicine not found!");

  if (name) dbGlobalMedicine.name = name;
  if (strength) dbGlobalMedicine.strength = strength;
  if (brand) dbGlobalMedicine.brand = brand;
  if (manufacturer) dbGlobalMedicine.manufacturer = manufacturer;
  if (type) dbGlobalMedicine.type = type;

  // start mongoose default session
  const session = await startSession();

  try {
    // start transaction for the session
    session.startTransaction();

    // update global medicine
    await GlobalMedicineService.save(dbGlobalMedicine, session);

    // update medicine docs
    await MedicineService.updateMany(
      { "global._id": dbGlobalMedicine._id },
      dbGlobalMedicine,
      session
    );

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

  return res.status(StatusCodes.CREATED).json({
    message: "Global Medicine updated successfully!",
    obj: dbGlobalMedicine,
  });
};

//delete
const deleteGlobalMedicine = async (req, res) => {
  const { globalMedicineId } = req.params;

  // validate global medicines
  const dbGlobalMedicine = await GlobalMedicineService.findById(
    globalMedicineId
  );
  if (!dbGlobalMedicine) throw new NotFoundError("Global Medicine not found!");

  //validate if global medicine assign to a pharmacy
  const dbMedicine = await MedicineService.findOneByGlobalMedicine(
    globalMedicineId
  );
  if (dbMedicine)
    throw new ConflictError("Global Medicine assigned to a pharmacy!");

  // delete global medicine
  await GlobalMedicineService.deleteOne(dbGlobalMedicine._id);

  return res.status(StatusCodes.CREATED).json({
    message: "Global Medicine deleted successfully!",
    obj: dbGlobalMedicine,
  });
};

module.exports = {
  createGlobalMedincine,
  getGlobalMedicines,
  updateGlobalMedicine,
  deleteGlobalMedicine,
};
