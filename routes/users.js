const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multerMiddleware');
const authMiddleware = require('../middlewares/auth');
const userController = require('../controllers/user.controllers');

router.get('/', authMiddleware.auth('admin'), userController.read);
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.patch('/:id', authMiddleware.auth('user'), upload.single('picture'), userController.update);
router.delete('/:id', authMiddleware.auth('user'), userController.destroy);
router.get('/:id', authMiddleware.auth('user'), userController.readbyid);
router.get('/search/username', userController.searchByusername);

module.exports = router;
