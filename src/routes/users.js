const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer');
const userController = require('../controllers/user.controllers');
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  isAdmin,
  isUserOwner,
  isUserOwnerNoRequest,
  checkUserDeletedBeforeLogin,
} = require('../middlewares/auth');

// Use proper HTTP methods for each operation
router.get('/', authenticateToken, authenticateRefreshToken, checkBlacklist, isAdmin, userController.getAllUsers);
router.post('/signup', userController.signUp);
router.post('/signin', checkUserDeletedBeforeLogin, userController.signIn);
router.post('/signout', authenticateToken, authenticateRefreshToken, checkBlacklist, userController.signOut);
router.patch('/id', authenticateToken, authenticateRefreshToken, isUserOwnerNoRequest, checkBlacklist, upload.single('image'), userController.updateUsers);
router.patch('/status/', authenticateToken, authenticateRefreshToken, isUserOwnerNoRequest, checkBlacklist, userController.setStatusOnline);
router.delete('/:id', authenticateToken, authenticateRefreshToken, isUserOwner, checkBlacklist, userController.deleteUsers);
router.get('/id', authenticateToken, authenticateRefreshToken, isUserOwnerNoRequest, checkBlacklist, userController.getDetailUsers);
router.get('/search/username', authenticateToken, authenticateRefreshToken, checkBlacklist, isAdmin, userController.searchUser);

module.exports = router;
