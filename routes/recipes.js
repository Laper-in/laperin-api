  const express = require("express");
  const router = express.Router();
  const recipeController = require("../controllers/recipe.controllers");
  const { upload } = require('../middlewares/multerMiddleware');
  const authMiddleware = require('../middlewares/auth');


  router.post("/", upload.single("image") ,authMiddleware.auth("admin"), recipeController.createRecipe);
  router.get("/", recipeController.readRecipes);
  router.get("/:id", recipeController.readRecipeById);
  router.patch("/:id", upload.single("image"),authMiddleware.auth("admin"), recipeController.updateRecipe);
  router.delete("/:id", authMiddleware.auth("admin"), recipeController.deleteRecipe);
  router.get("/search/name", recipeController.searchRecipeByName);

  module.exports = router;
