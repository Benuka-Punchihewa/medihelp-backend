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
  const { keyword } = req.query;

  const queryObj = {};
  if (keyword) queryObj.name = { $regex: keyword, $options: "i" };

  const result = await GlobalMedicineService.getGlobalMedicines(
    queryObj,
    pagable
  );

  return res.status(StatusCodes.OK).json(result);
};

module.exports = { createGlobalMedincine, getGlobalMedicines };
