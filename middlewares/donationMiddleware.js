const { uploadToBucket } = require("../middlewares/gcsMiddleware");
const donationController = require("../controllers/donation.controllers");

const handleFileUpload = (req, res, next) => {
  try {
    const destinationFolder = "donations"; // Ganti dengan folder destinasi yang diinginkan
    uploadToBucket(
      req.file,
      (err, fileInfo) => {
        console.log("File uploaded to GCS:", fileInfo);
        if (err) {
          return next(err);
        }
        const imageUrl = fileInfo ? fileInfo.imageUrl : null;
        // Call the create function directly with the file information
        donationController.createDonation(req, res, next, imageUrl);
      },
      destinationFolder
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { handleFileUpload };
