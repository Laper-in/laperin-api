    const express = require("express");
    const router = express.Router();
    const { upload } = require('../middlewares/multer');
    const ingredientController = require("../controllers/ingredient.controllers");
    const {
        authenticateToken,
        authenticateRefreshToken,
        checkBlacklist,
        isAdmin,
        isUserOwner,
      } = require('../middlewares/auth');

    router.get("/", ingredientController.getAllIngredient);
    router.post("/",authenticateToken, authenticateRefreshToken, isAdmin, checkBlacklist, upload.single('image'), ingredientController.createIngredient);
    router.patch("/:id",authenticateToken,authenticateRefreshToken,upload.single('image'), ingredientController.updateIngredient);
    router.delete("/:id",authenticateToken,authenticateRefreshToken,isUserOwner,checkBlacklist, ingredientController.deleteIngredient);
    router.get("/search",authenticateToken,authenticateRefreshToken, ingredientController.searchIngredientByName);

    module.exports = router;
