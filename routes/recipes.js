const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controllers');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/recipes/images/'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      const ext = file.originalname.split('.').pop();
      cb(null, Date.now() + '-' + file.fieldname + '.' + ext); // Unique filename
    },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), recipeController.createRecipe);
router.get('/', recipeController.readRecipes);
router.get('/:id', recipeController.readRecipeById);
router.patch('/:id', upload.single('image'), recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);
router.get('/search/name', recipeController.searchRecipeByName);

module.exports = router;
