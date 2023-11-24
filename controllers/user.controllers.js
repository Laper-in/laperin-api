const e = require('express');
const { User } = require('../models');
const { use } = require('../routes/users');
const Validator = require("fastest-validator");
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
                username : req.body.username,
                password : hash,
                email : req.body.email,
                fullname : req.body.fullname,
                picture : req.body.picture,
                bio : req.body.bio,
                createdAt : new Date(),
                updatedAt : new Date(),
                createdBy : 0,
                updatedBy : 0,
                isDeleted : false
            }
        
            const schema = {
                username : { type: "string", min: 5, max: 50, optional: false },
                email : { type: "email", optional: false },
                password : { type: "string", min: 5, max: 255, optional: false },
            }
        
            //-- VALIDASI EMAIL
            User.findOne({ where : {email : req.body.email} }).then(user => {
                if(user){
                    // -- Email sudah digunakan
                    res.status(400).json({
                        message : 'Email already exist'
                    });
                }else{
                    // -- Email belum digunakan
        
                    // -- VALIDASI DATA
                    const validationResult = v.validate(data, schema);
        
                    if (validationResult !== true) {
                        // -- Data tidak valid
                        res.status(400).json({
                            message : 'Validation Failed',
                            data: validationResult
                        });
                    } else {
                        // -- Create user jika email belum digunakan
                        // -- Data valid dan bisa disimpan kedalam database
                        User.create(data).then(result => {
                            res.status(200).json({
                                message : 'Success',
                                data: result
                            });
                        }).catch(err => {
                            res.status(500).json({
                                message : 'Register Failed',
                                data: err
                            });
                        });                
                    }            
                }
            }).catch(err => {
                res.status(500).json({
                    message : 'Something wrong',
                    data: err
                });        
            });
        
        
        })
    })
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
        username : req.body.username,
        password : req.body.password,
        email : req.body.email,
        fullname : req.body.fullname,
        picture : req.body.picture,
        bio : req.body.bio,
        updatedAt : new Date(),
        updatedBy : 0,
        isDeleted : false
    }

    const schema = {
        username : { type: "string", min: 5, max: 50, optional: false },
        email : { type: "email", optional: false },
        password : { type: "string", min: 5, max: 50, optional: false },
    }    


    // -- VALIDASI DATA
    const validationResult = v.validate(data, schema);

    if (validationResult !== true) {
        // -- Data tidak valid
        res.status(400).json({
            message : 'Validation Failed',
            data: validationResult
        });
    } else {
        // -- Create user jika email belum digunakan
        // -- Data valid dan bisa disimpan kedalam database
        User.update(data, {where : {id : req.params.id}}).then(result => {
            res.status(200).json({
                message : 'Success update data',
                data: result
            });
        }).catch(err => {
            res.status(500).json({
                message : 'Updated Failed',
                data: err
            });
        });               
    }      
    

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
    User.findOne({ where : {email : req.body.email} }).then(user => {
        if(user){
            if(user.isDeleted == false){
                bcrypt.compare(req.body.password, user.password, function(err, result) {                    
                    if (result)    {
                         // Pembuatan TOKEN saat login sukses
                        const token = jwt.sign({
                            email : user.email,
                            username : user.username,
                            userid : user.id
                        }, JWT_SECRET, function (err, token){
                            res.status(200).json({
                                status : "SUCCESS",
                                message : 'Success login',
                                token : token
                            });      
                        });
                    } else {
                        res.status(401).json({
                            status : "FAILED",
                            message : "Worng Password",
                            data : err
                        })
                    }
                })

            } else {
                res.status(401).json({
                    message : 'User has been deleted',
                data: user
                });
            }
        } else {
            res.status(401).json({
                message : 'Email not found',
                data: user
            });
        }
    }).catch(err => {
        res.status(500).json({
            message : 'Login Failed',
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
