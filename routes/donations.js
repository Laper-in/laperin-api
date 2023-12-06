    const express = require("express");
    const router = express.Router();
    const donationController = require("../controllers/donation.controllers");
    const multer = require("multer");
    const authMiddleware = require('../middlewares/auth');
    

    const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/donations/images");
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split(".").pop();
        cb(null, Date.now() + "-" + file.fieldname + "." + ext);
    },
    });

    const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ["jpg", "jpeg", "png"];
        const ext = file.originalname.split(".").pop().toLowerCase();
        if (!allowedTypes.includes(ext)) {
        const error = new Error("Only JPG and PNG files are allowed");
        error.code = "LIMIT_FILE_TYPES";
        return cb(error, false);
        }
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
        const error = new Error("File size exceeds the limit (2MB)");
        error.code = "LIMIT_FILE_SIZE";
        return cb(error, false);
        }
        cb(null, true);
    },
    });

    router.post("/", upload.single("image") ,authMiddleware.auth("user"), donationController.createDonation);
    router.get("/:id", donationController.readAllDonationsByUserId);
    // router.patch("/:id", upload.single("image"),authMiddleware.auth("user"), donationController.updateRecipe);
    router.delete("/:id", authMiddleware.auth("user"), donationController.deleteDonation);
    router.get("/", donationController.readDonation);
    router.get("/closest/:lon/:lat", donationController.readClosestDonation);

    module.exports = router;


