    const express = require("express");
    const router = express.Router();
    const ingredientController = require("../controllers/ingredient.controllers");
    const authMiddleware = require("../middlewares/auth");

    router.get("/", ingredientController.readIngredients);
    router.post("/",authMiddleware.auth("admin"), ingredientController.createIngredient);
    router.get("/:id", ingredientController.readIngredientById);
    router.patch("/:id",authMiddleware.auth("admin"), ingredientController.updateIngredient);
    router.delete("/:id",authMiddleware.auth("admin"), ingredientController.deleteIngredient);
    router.get("/search/name", ingredientController.searchIngredientByName);

    module.exports = router;
