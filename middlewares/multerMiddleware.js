const multer = require("multer");

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: function (req, file, cb) {
    const allowedImageTypes = ["jpg", "jpeg", "png"];
    const allowedVideoTypes = ["mp4", "avi", "mkv"];

    const ext = file.originalname.split(".").pop().toLowerCase();

    if (req.files && req.files['image'] && allowedImageTypes.includes(ext)) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        const error = new Error("Image file size exceeds the limit (2MB)");
        error.code = "LIMIT_FILE_SIZE";
        return cb(error, false);
      }
    } else if (req.files && req.files['video'] && allowedVideoTypes.includes(ext)) {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        const error = new Error("Video file size exceeds the limit (50MB)");
        error.code = "LIMIT_FILE_SIZE";
        return cb(error, false);
      }
    } else {
      const error = new Error("Invalid file type");
      error.code = "LIMIT_FILE_TYPES";
      return cb(error, false);
    }

    cb(null, true);
  },
});

module.exports = { upload };
