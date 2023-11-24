var express = require('express');
var router = express.Router();

const userController = require('../controllers/user.controllers');

/* GET users listing. */
router.get('/',userController.read);
router.post('/',userController.signup);
router.post('/signin',userController.signin);
router.patch('/:id',userController.update);
router.delete('/:id',userController.destroy);
router.get('/:id',userController.readbyid);



module.exports = router;
