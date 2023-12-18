    const express = require("express");
    const router = express.Router();
    const donationController = require("../controllers/donation.controllers");
    const { upload } = require('../middlewares/multer');
    const {
        authenticateToken,
        authenticateRefreshToken,
        checkBlacklist,
        isAdmin,
        isUserOwner,
        isUserOwnerNoRequest,
        isDonationOwner,
      } = require('../middlewares/auth');
    
    router.post("/", upload.single("image") ,authenticateToken,authenticateRefreshToken, donationController.createDonation);
    router.get("/",authenticateToken,authenticateRefreshToken,checkBlacklist, donationController.getAllDonation);
    router.get("/user/", authenticateToken, authenticateRefreshToken,isUserOwnerNoRequest, checkBlacklist,donationController.getAllDonationByUserId);
    router.get("/closest/:lon/:lat",authenticateToken, authenticateRefreshToken, checkBlacklist, donationController.getAllClosestDonation);
    router.get("/:id",authenticateToken, authenticateRefreshToken, checkBlacklist, donationController.getDetailDonation);
    router.delete("/:id", authenticateToken,authenticateRefreshToken,isDonationOwner,checkBlacklist, donationController.deleteDonation);
    router.patch("/:id",  authenticateToken, authenticateRefreshToken, checkBlacklist,isDonationOwner, upload.single('image'), donationController.updateDonation);

    module.exports = router;


