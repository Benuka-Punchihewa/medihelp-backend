const { StatusCodes } = require("http-status-codes");
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

const getGlobalMedicines = async (req, res) => {
  const { pagable } = req.body;

  const result = await GlobalMedicineService.getGlobalMedicines({}, pagable);

  return res.status(StatusCodes.OK).json(result);
};

module.exports = { createGlobalMedincine, getGlobalMedicines };
