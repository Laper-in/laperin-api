const { uploadToBucket } = require("../middlewares/gcsMiddleware");
const userController = require("../controllers/user.controllers");

const handleFileUpload = (req, res, next) => {
  try {
    const destinationFolder = "users"; // Ganti dengan folder destinasi yang diinginkan
    uploadToBucket(
      req.file,
      (err, fileInfo) => {
        console.log("log umw:", fileInfo);
        if (err) {
          return next(err);
        }
        const imageUrl = fileInfo ? fileInfo.imageUrl : null;
        // Call the update function directly with the file information
        userController.update(req, res, next, imageUrl);
      },
      destinationFolder
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { handleFileUpload };
