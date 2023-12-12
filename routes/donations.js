    const express = require("express");
    const router = express.Router();
    const donationController = require("../controllers/donation.controllers");
    const { upload } = require('../middlewares/multerMiddleware');
    const multer = require("multer");
    const authMiddleware = require('../middlewares/auth');
    
    router.post("/", upload.single("image") ,authMiddleware.auth("user"), donationController.createDonation);
    router.get("/:id", donationController.readAllDonationsByUserId);
    // router.patch("/:id", upload.single("image"),authMiddleware.auth("user"), donationController.updateRecipe);
    router.delete("/:id", authMiddleware.auth("user"), donationController.deleteDonation);
    router.get("/", donationController.readDonation);
    router.get("/closest/:lon/:lat", donationController.readClosestDonation);

    module.exports = router;


