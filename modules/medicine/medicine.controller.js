const { StatusCodes } = require("http-status-codes");
const Medicine = require("./medicine.model");
const PharmacyService = require("../pharmacy/pharmacy.service");
const NotFoundError = require("../error/error.classes/NotFoundError");
const ConflictError = require("../error/error.classes/ConflictError");
const PharamcyUtil = require("../pharmacy/pharmacy.util");
const GlobalMedicineService = require("../globalMedicine/globalMedicine.service");
const MedicineService = require("./medicine.service");
const { startSession } = require("mongoose");

const createMedicine = async (req, res) => {
  const medicine = new Medicine(req.body);

  // start mongoose default session
  const session = await startSession();

  try {
    // start transaction for the session
    session.startTransaction();

    // validate pharmacy
    const dbPharmacy = await PharmacyService.findById(
      req.params.pharmacyId,
      session
    );
    if (!dbPharmacy) throw new NotFoundError("Pharmacy not found!");

    // validate authority
    PharamcyUtil.validatePharmacyAuthority(req.body.auth, dbPharmacy._id);

    // validate global medicine
    const dbGlobalMedicine = await GlobalMedicineService.findById(
      req.body?.globalMedicine?._id,
      session
    );
    if (!dbGlobalMedicine)
      throw new NotFoundError("Global medicine not found!");

    // validate medicine for duplications
    const dbMedicine = await MedicineService.findMedicineByPharmacyId(
      dbPharmacy._id,
      dbGlobalMedicine._id,
      session
    );
    if (dbMedicine) throw new ConflictError("Medicine already exists!");

    // construct body
    medicine.global._id = dbGlobalMedicine._id;
    medicine.global.doc = dbGlobalMedicine;
    medicine.pharmacy._id = dbPharmacy._id;

    // save medicine
    await MedicineService.save(medicine, session);

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
    message: "Medicine created successfully!",
    obj: medicine,
  });
};

const getMedicineByGId = async (req, res) => {
  const { globalMedicineId, pharmacyId } = req.params;
  const { auth } = req.body;

  // validate pharmacy
  const dbPharamacy = await PharmacyService.findById(pharmacyId);
  if (!dbPharamacy) throw new NotFoundError("Pharmacy not found!");

  // validate authority
  PharamcyUtil.validatePharmacyAuthority(auth, pharmacyId);

  // validate global medicine
  const dbGlobalMedicine = await GlobalMedicineService.findById(
    globalMedicineId
  );
  if (!dbGlobalMedicine) throw new NotFoundError("Global medicine not found!");

  const dbMedicine = await MedicineService.findMedicineByPharmacyId(
    pharmacyId,
    globalMedicineId
  );
  if (!dbMedicine) throw new NotFoundError("Medicine not found!");

  return res.status(StatusCodes.CREATED).json(dbMedicine);
};

module.exports = { createMedicine, getMedicineByGId };
