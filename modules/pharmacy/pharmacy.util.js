const constants = require("../../constants");
const ForbiddenError = require("../error/error.classes/ForbiddenError");
const PharmacyService = require("./pharmacy.service");
const CommonUtil = require("../common/common.util");

const validatePharmacyAuthority = (auth, pharmacyId) => {
  if (auth.role !== constants.USER.ROLES.ADMIN) {
    const pharmacy = auth.pharmacies.find(
      (pharamcy) => pharamcy._id === pharmacyId
    );
    if (!pharmacy)
      throw new ForbiddenError(`You're unauthorized to access this resource!`);
  }
};

const getPharmaciesSortedByNearestLocation = async (lat, lang) => {
  // clone pharmacies object
  const pharmacies = JSON.parse(JSON.stringify(await PharmacyService.getAll()));

  if (!pharmacies) return [];

  // calculate and inject crow distance
  for (let pharmacy of pharmacies) {
    const crowDistance = CommonUtil.getDistanceBetweenPoints(
      pharmacy.location.latitude,
      pharmacy.location.longitude,
      lat,
      lang
    );

    pharmacy.crowDistance = crowDistance;
  }

  // sort by crow distnace in asc order
  pharmacies.sort((a, b) => {
    return a.crowDistance - b.crowDistance;
  });

  return pharmacies;
};

module.exports = {
  validatePharmacyAuthority,
  getPharmaciesSortedByNearestLocation,
};
