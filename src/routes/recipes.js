const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipe.controllers");
const { upload, uploadVideo } = require("../middlewares/multerMiddleware");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  isAdmin,
  isUserOwner,
} = require("../middlewares/auth");

router.post(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  isAdmin,
  checkBlacklist,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  recipeController.createRecipe
);
router.get("/", recipeController.getAllRecipe);
router.get("/:id", recipeController.getDetailRecipe);
router.patch(
  "/:id",
  upload.single("image"),
  authenticateToken,
  authenticateRefreshToken,
  isAdmin,
  checkBlacklist,
  recipeController.updateRecipe
);
router.delete(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  isUserOwner,
  checkBlacklist,
  recipeController.deleteRecipe
);

router.get("/sort/category", recipeController.getAllRecipeByCategory);
router.get("/search/name", recipeController.searchRecipeByName);
router.get("/search/id", recipeController.searchRecipeById);
router.get("/search/category", recipeController.searchRecipeByCategory);
router.get("/search/ingredient", recipeController.searchRecipeByIngredient);

module.exports = router;
