const express = require('express');
const router = express.Router();
const multer = require('multer');

const userController = require('../controllers/user.controllers');
const authMiddleware = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/users/pictures'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, Date.now() + '-' + file.fieldname + '.' + ext); // Unique filename
  },
});

const upload = multer({ storage: storage });

router.get('/', userController.read);
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.patch('/:id', authMiddleware.auth('user'), upload.single('picture'), userController.update);
router.delete('/:id', authMiddleware.auth('user'), userController.destroy);
router.get('/:id', authMiddleware.auth('user'), userController.readbyid);

module.exports = router;
