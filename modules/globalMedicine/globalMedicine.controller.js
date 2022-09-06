const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../error/error.classes/NotFoundError");
const GlobalMedicine = require("./globalMedicine.model");
const GlobalMedicineService = require("./globalMedicine.service");

const createGlobalMedincine = async (req, res) => {
  const globalMedicine = new GlobalMedicine(req.body);

  await GlobalMedicineService.save(globalMedicine);

  return res.status(StatusCodes.CREATED).json({
    message: "Global Medicine created successfully!",
    obj: globalMedicine,
  });
};

//suu
const getGlobalMedicines = async (req, res) => {
  const { pagable } = req.body;
  const { globalMedicineId } = req.params;

  //validate global medicines
  const dbGlobalMedicine = await GlobalMedicineService.findById(globalMedicineId);
  if (!dbGlobalMedicine) throw new NotFoundError("Global Medicine not found!");

  const queryObj = {"globalMedicine._id": globalMedicineId};
  const result = await GlobalMedicineService.getGlobalMedicines(queryObj,pagable);

  return res.status(StatusCodes.OK).json(result);

};

module.exports = { createGlobalMedincine, getGlobalMedicines};
