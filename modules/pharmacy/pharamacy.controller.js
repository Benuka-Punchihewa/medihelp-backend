const { StatusCodes } = require("http-status-codes");
const { startSession } = require("mongoose");
const constants = require("../../constants");
const ForbiddenError = require("../error/error.classes/ForbiddenError");
const NotFoundError = require("../error/error.classes/NotFoundError");
const Pharmacy = require("./pharmacy.model");
const PharmacyService = require("./pharmacy.service");
const UserService = require("../user/user.service");
const BadRequestError = require("../error/error.classes/BadRequestError");
const PharmacyUtil = require("../pharmacy/pharmacy.util");
const commonUtil = require("../common/common.util");

const createPharmacy = async (req, res) => {
  const { auth } = req.body;

  // role validation
  if (auth.role !== constants.USER.ROLES.PHARMACY_OWNER)
    throw new ForbiddenError(
      `You're unauthorized to add pharmacies! Please create an account as a pharmacy owner.`
    );

  // construct pharmacy body
  const pharmacy = new Pharmacy(req.body);
  pharmacy.owner._id = auth._id;

  // start mongoose default session
  const session = await startSession();

  try {
    // start transaction for the session
    session.startTransaction();

    // save pharmacy
    await PharmacyService.save(pharmacy, session);

    // retrieve user
    const dbUser = await UserService.findById(auth._id, session);
    if (!dbUser) throw new NotFoundError("User not found!");

    // update user
    dbUser.pharmacies.push({ _id: pharmacy._id, name: pharmacy.name });
    await UserService.save(dbUser, session);

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
    .json({ message: "Pharmacy created successfully!", obj: pharmacy });
};

const findAllPharmacyPagination = async (req, res) => {
  const { pagable } = req.body;

  const result = await PharmacyService.findAllPharmacyPagination({}, pagable);

  return res.status(StatusCodes.OK).json(result);
};

//get pharmacy by id
const getPharmacyById = async (req, res) => {
  const { pharmacyId } = req.params;

  const dbPharamacy = await PharmacyService.findById (pharmacyId);

  return res.status(StatusCodes.OK).json(dbPharamacy);
};


//get nearest pharmacy
const getPharmaciesByNearestLocation = async (req, res) => {
  const {keyword,lat,lng} = req.query;
  const {pagable} = req.body;
  
  if(!lat || !lng )
    throw new BadRequestError(
      "Provide both longitudes and latitudes"
    );

  const nPharamacies = await PharmacyUtil.getPharmaciesSortedByNearestLocation(
          lat,
          lng
  );

  const filterednPharmacies = nPharamacies.filter(pharmacy => pharmacy.name.toLowerCase().includes(keyword.toLowerCase()))
  
  const result = commonUtil.arrPaginate(filterednPharmacies, pagable);
  
  return res.status(StatusCodes.OK).json(result);
};
   

// update a Trainer
const updatePharmacy = async(req, res) => {

  const { pharmacyId } = req.params

  const dbPharmacy = await Pharmacy.findByIdAndUpdate({_id: pharmacyId}, {
      ...req.body
  })

  if(!dbPharmacy) throw new NotFoundError("Pharmacy not found!");

  return res.status(StatusCodes.CREATED).json({
    message:"Pharmacy Update Succesfully!",
    obj:dbPharmacy,
  });
  
}

// delete Pharmacy
const deletePharmacy = async (req, res) => {
  const { pharmacyId } = req.params

  const dbPharmacy  = await Pharmacy.findOneAndDelete({_id: pharmacyId})
  
  if(!dbPharmacy) throw new NotFoundError("Pharmacy not found!");

  return res.status(StatusCodes.CREATED).json({
    message:"Pharmacy Delete Succesfully!",
    obj:dbPharmacy,
  });
  
}

module.exports = { createPharmacy, findAllPharmacyPagination, getPharmacyById,getPharmaciesByNearestLocation,updatePharmacy,deletePharmacy};
