const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredient.controllers');
const authMiddleware = require('../middlewares/auth');

router.get('/', ingredientController.readIngredients);
router.post('/', ingredientController.createIngredient);
router.get('/:id', ingredientController.readIngredientById);
router.patch('/:id', ingredientController.updateIngredient);
router.delete('/:id', ingredientController.deleteIngredient);

module.exports = router;
