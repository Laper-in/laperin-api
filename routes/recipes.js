const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipe.controllers");
const { upload, uploadVideo } = require('../middlewares/multerMiddleware');
const {
    authenticateToken,
    authenticateRefreshToken,
    checkBlacklist,
    isAdmin,
    isUserOwner,
} = require('../middlewares/auth');

router.post("/", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), recipeController.createRecipe);
router.get("/", recipeController.getAllRecipe);
router.get("/:id", recipeController.getDetailRecipe);
router.patch("/:id", upload.single("image"), authenticateToken, authenticateRefreshToken, isUserOwner, checkBlacklist, recipeController.updateRecipe);
router.delete("/:id", authenticateToken, authenticateRefreshToken, isUserOwner, checkBlacklist, recipeController.deleteRecipe);
router.get("/search/name", recipeController.searchRecipeByName);
router.get("/search/id", recipeController.searchRecipeById);
router.get("/search/category", recipeController.searchRecipeByCategory);
router.get("/search/ingredient", recipeController.searchRecipeByIngredient);

module.exports = router;
