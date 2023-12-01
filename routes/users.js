const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controllers');
const authMiddleware = require('../middlewares/auth');

router.get('/',authMiddleware.auth('admin'), userController.read);
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.patch('/:id', authMiddleware.auth('user'), userController.update);
router.delete('/:id', authMiddleware.auth('admin'), userController.destroy);
router.get('/:id', authMiddleware.auth('user'), userController.readbyid);

module.exports = router;
