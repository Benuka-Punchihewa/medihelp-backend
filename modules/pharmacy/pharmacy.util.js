const constants = require("../../constants");
const ForbiddenError = require("../error/error.classes/ForbiddenError");

const validatePharmacyAuthority = (auth, pharmacyId) => {
  if (auth.role !== constants.USER.ROLES.ADMIN) {
    const pharmacy = auth.pharmacies.find(
      (pharamcy) => pharamcy._id === pharmacyId
    );
    if (!pharmacy)
      throw new ForbiddenError(`You're unauthorized to access this resource!`);
  }
};

module.exports = { validatePharmacyAuthority };
