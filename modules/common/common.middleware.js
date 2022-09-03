const multer = require("multer");
const BadRequestError = require("../error/error.classes/BadRequestError");

const multerUploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limiting files size to 5 MB
  },
});

const paginate = (req, res, next) => {
  const { page, limit, orderBy } = req.query;
  if (!page) throw new BadRequestError("Page number is required!");
  if (!limit) throw new BadRequestError("Limit is required!");
  if (!orderBy) throw new BadRequestError("OrderBy is required!");

  req.body.pagable = { page, limit, orderBy };
  next();
};

module.exports = {
  multerUploader,
  paginate,
};
