const express = require('express');
const router = express.Router();
const multer = require('multer');

const userController = require('../controllers/user.controllers');
const authMiddleware = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/users/pictures');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, Date.now() + '-' + file.fieldname + '.' + ext);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['jpg', 'jpeg', 'png'];
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      const error = new Error('Only JPG and PNG files are allowed');
      error.code = 'LIMIT_FILE_TYPES';
      return cb(error, false);
    }
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const error = new Error('File size exceeds the limit (2MB)');
      error.code = 'LIMIT_FILE_SIZE';
      return cb(error, false);
    }
    cb(null, true);
  },
});

router.get('/',authMiddleware.auth('admin'), userController.read);
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.patch('/:id', authMiddleware.auth('user'), upload.single('picture'), userController.update);
router.delete('/:id', authMiddleware.auth('user'), userController.destroy);
router.get('/:id', authMiddleware.auth('user'), userController.readbyid);
router.get('/search/username', userController.searchByusername);

module.exports = router;
