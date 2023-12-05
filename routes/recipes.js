  const express = require("express");
  const router = express.Router();
  const recipeController = require("../controllers/recipe.controllers");
  const multer = require("multer");
  const authMiddleware = require('../middlewares/auth');

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/recipes/images");
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

  router.post("/", upload.single("image") ,authMiddleware.auth("admin"), recipeController.createRecipe);
  router.get("/", recipeController.readRecipes);
  router.get("/:id", recipeController.readRecipeById);
  router.patch("/:id", upload.single("image"),authMiddleware.auth("admin"), recipeController.updateRecipe);
  router.delete("/:id", authMiddleware.auth("admin"), recipeController.deleteRecipe);
  router.get("/search/name", recipeController.searchRecipeByName);

  module.exports = router;
