const multer = require("multer");

const multerUploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limiting files size to 5 MB
  },
});

module.exports = {
  multerUploader,
};
