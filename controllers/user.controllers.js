const e = require('express');
const { User } = require('../models');
const { use } = require('../routes/users');
const { nanoid } = require("nanoid");
const Validator = require("fastest-validator");
const { Op } = require('sequelize');
const v = new Validator();
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/users/pictures'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      const ext = file.originalname.split('.').pop();
      cb(null, Date.now() + '-' + file.fieldname + '.' + ext); // Unique filename
    },
  });
  


//CREATE USER
function signup(req, res, next){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            const data = {
                id: nanoid(10), // Use nanoid for generating ID
                username: req.body.username,
                password: hash,
                email: req.body.email,
                fullname: req.body.fullname,
                createdAt: new Date(),
            };
        
            const schema = {
                username: { type: "string", min: 5, max: 50, optional: false },
                email: { type: "email", optional: false },
                password: { type: "string", min: 5, max: 255, optional: false },
            };
        
            User.findOne({ where: { email: req.body.email } }).then(user => {
                if(user){
                    res.status(400).json({
                        message: 'Email already exists',
                    });
                } else {
                    const validationResult = v.validate(data, schema);
        
                    if (validationResult !== true) {
                        res.status(400).json({
                            message: 'Validation Failed',
                            data: validationResult,
                        });
                    } else {
                        User.create(data).then(result => {
                            res.status(200).json({
                                message: 'Success',
                                data: result,
                            });
                        }).catch(err => {
                            res.status(500).json({
                                message: 'Register Failed',
                                data: err,
                            });
                        });                
                    }            
                }
            }).catch(err => {
                res.status(500).json({
                    message: 'Something went wrong',
                    data: err,
                });        
            });
        });
    });
}  
//READ USER
function read(req, res, next){
    User.findAll({
        where : {isDeleted : false}
    }).then(users => {  
        res.send(users);
    }).catch(err => {
        res.send(err);
    });
}

//READ USER BY ID
function readbyid(req, res, next) {
    User.findByPk(req.params.id).then(user => {
        res.send(user);
    }).catch(err => {
        res.send(err);
    });
}
//UPDATE USER
function update(req, res, next) {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(req.body.password, salt, function (err, hashedPassword) {
        if (err) {
          console.error('Hashing Error:', err);
          return res.status(500).json({
            message: 'Password hashing failed',
            data: err,
          });
        }
  
        const data = {
          password: hashedPassword,
          email: req.body.email,
          fullname: req.body.fullname,
          picture: req.file ? req.file.filename : req.body.picture,
          alamat: req.body.alamat,
          telephone: req.body.telephone,
          updatedAt: new Date(),
          updatedBy: 0,
        };
  
        // Check if email is provided and exists for a different user
        if (data.email) {
          User.findOne({
            where: {
              email: data.email,
              id: { [Op.not]: req.params.id },
            },
          })
            .then(existingUser => {
              if (existingUser) {
                return res.status(400).json({
                  message: 'Email already exists',
                });
              }
  
              // Continue with the update
              performUpdate();
            })
            .catch(err => {
              console.error('Database Error:', err);
              res.status(500).json({
                message: 'Something went wrong',
                data: err,
              });
            });
        } else {
          // No email provided, proceed with the update
          performUpdate();
        }
  
        // Function to perform the update
        function performUpdate() {
          User.update(data, { where: { id: req.params.id } })
            .then(result => {
              res.status(200).json({
                message: 'Success update data',
                data: result,
              });
            })
            .catch(err => {
              console.error('Update Error:', err);
              res.status(500).json({
                message: 'Update Failed',
                data: err,
              });
            });
        }
      });
    });
  }

//DELETE USER
function destroy(req,res, next){
    const data ={
        isDeleted : true,
        deletedAt : new Date(),
        deletedBy : 1
    }

    User.update(data, {where : {id : req.params.id}}).then(result => {
        res.status(200).json({
            Message : "Success Delete Data",
            data : result
        });
    }).catch(err => {
        res.status(500).json({
            Message : `Delete Failed ${err}`,
            data : err
        });
    });
    
}

//SIGNIN USER
function signin(req, res, next){
    const { username, email, password } = req.body;

    // Choose either email or username for login
    const loginField = email ? { email } : { username };

    User.findOne({ where: loginField }).then(user => {
        if (user && !user.isDeleted) {
            bcrypt.compare(password, user.password, function(err, result) {                    
                if (result)    {
                    // Pembuatan TOKEN saat login sukses
                    const token = jwt.sign({
                        email: user.email,
                        username: user.username,
                        userid: user.id,
                        role: user.role
                    }, JWT_SECRET, function (err, token){
                        res.status(200).json({
                            status: "SUCCESS",
                            message: 'Success login',
                            token: token
                        });      
                    });
                } else {
                    res.status(401).json({
                        status: "FAILED",
                        message: "Wrong Password",
                        data: err
                    });
                }
            });
        } else {
            res.status(401).json({
                message: 'User not found or has been deleted',
            });
        }
    }).catch(err => {
        res.status(500).json({
            message: 'Login Failed',
            data: err
        });
    });
}



    module.exports = {
        signup,
        read,
        update,
        destroy,
        signin,
        readbyid
    };
