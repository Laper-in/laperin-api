const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controllers');


router.post('/', recipeController.createRecipe);
router.get('/', recipeController.readRecipes);
router.get('/:id', recipeController.readRecipeById);
router.patch('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;
