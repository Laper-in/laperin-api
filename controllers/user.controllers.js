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
function update(req, res, next){
    const data = {
        password : req.body.password,
        email : req.body.email,
        fullname : req.body.fullname,
        picture : req.body.picture,
        alamat : req.body.alamat,
        telephone: req.body.telephone,
        updatedAt : new Date(),
        updatedBy : 0
    }

    const schema = {
        email : { type: "email", optional: false },
        password : { type: "string", min: 5, max: 50, optional: false },
    }    

    // -- Check if the email already exists
    User.findOne({ where: { email: req.body.email, id: { [Op.not]: req.params.id } } })
        .then(existingUser => {
            if (existingUser) {
                // Email is already in use
                res.status(400).json({
                    message: 'Email already exists',
                });
            } else {
                // -- VALIDATE DATA
                const validationResult = v.validate(data, schema);

                if (validationResult !== true) {
                    // -- Data is not valid
                    res.status(400).json({
                        message: 'Validation Failed',
                        data: validationResult
                    });
                } else {
                    // -- Update user if the email is not in use
                    User.update(data, { where: { id: req.params.id } }).then(result => {
                        res.status(200).json({
                            message: 'Success update data',
                            data: result
                        });
                    }).catch(err => {
                        res.status(500).json({
                            message: 'Update Failed',
                            data: err
                        });
                    });               
                }
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Something went wrong',
                data: err
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
