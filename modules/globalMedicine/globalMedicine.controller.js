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

module.exports = { createGlobalMedincine };
