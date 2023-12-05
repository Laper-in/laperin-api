        const e = require("express");
        const { User } = require("../models");
        const { use } = require("../routes/users");
        const { nanoid } = require("nanoid");
        const Validator = require("fastest-validator");
        const { Op } = require("sequelize");
        const v = new Validator();
        var jwt = require("jsonwebtoken");
        const bcrypt = require("bcrypt");
        require("dotenv").config();
        const JWT_SECRET = process.env.JWT_SECRET;
        const multer = require("multer");
        const path = require("path");
        const paginate = require("sequelize-paginate");

        const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads/users/pictures");
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".").pop();
            cb(null, Date.now() + "-" + file.fieldname + "." + ext);
        },
        });

        const upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            const allowedTypes = ["jpg", "jpeg", "png"];
            const ext = file.originalname.split(".").pop().toLowerCase();
            if (!allowedTypes.includes(ext)) {
            const error = new Error("Only JPG and PNG files are allowed");
            error.code = "LIMIT_FILE_TYPES";
            return cb(error, false);
            }
            const maxSize = 2 * 1024 * 1024;
            if (file.size > maxSize) {
            const error = new Error("File size exceeds the limit (2MB)");
            error.code = "LIMIT_FILE_SIZE";
            return cb(error, false);
            }
            cb(null, true);
        },
        });

        // CREATE USER
        function signup(req, res, next) {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    const data = {
                    id: nanoid(10),
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

            Promise.all([
                User.findOne({ where: { email: req.body.email } }),
                User.findOne({ where: { username: req.body.username } }),
            ])
                .then(([existingEmailUser, existingUsernameUser]) => {
                if (existingEmailUser) {
                    res.status(400).json({
                    message: "Email already exists",
                    });
                } else if (existingUsernameUser) {
                    res.status(400).json({
                    message: "Username already exists",
                    });
                } else {
                    const validationResult = v.validate(data, schema);

                    if (validationResult !== true) {
                    res.status(400).json({
                        message: "Validation Failed",
                        data: validationResult,
                    });
                    } else {
                    // Additional validation for username (no spaces)
                    if (/\s/.test(data.username)) {
                        res.status(400).json({
                        message: "Username cannot contain spaces",
                        });
                        return;
                    }

                    // Additional validation for email domain
                    if (
                        !/\b(?:gmail\.com|yahoo\.com|example\.com)\b/.test(data.email)
                    ) {
                        res.status(400).json({
                        message:
                            "Invalid email domain. Supported domains: gmail.com, yahoo.com, example.com",
                        });
                        return;
                    }

                    User.create(data)
                        .then((result) => {
                        res.status(200).json({
                            message: "Success",
                            data: result,
                        });
                        })
                        .catch((err) => {
                        res.status(500).json({
                            message: "Register Failed",
                            data: err,
                        });
                        });
                    }
                }
                })
                .catch((err) => {
                res.status(500).json({
                    message: "Something went wrong",
                    data: err,
                });
                });
            });
        });
        }
        //READ USER
        function read(req, res, next) {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        User.paginate({
            page: page,
            paginate: pageSize,
            where: { isDeleted: false },
        })
            .then((result) => {
            const response = {
                users: result.docs,
                total_count: result.total,
                total_pages: result.pages,
                current_page: result.page,
            };

            res.send(response);
            })
            .catch((err) => {
            res.status(500).send(err);
            });
        }

        //READ USER BY ID
        function readbyid(req, res, next) {
        User.findByPk(req.params.id)
            .then((user) => {
            res.send(user);
            })
            .catch((err) => {
            res.send(err);
            });
        }
        //UPDATE USER
        function update(req, res, next) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, hashedPassword) {
            if (err) {
                console.error("Hashing Error:", err);
                return res.status(500).json({
                message: "Password hashing failed",
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
            const schema = {
                email: { type: "email", optional: false },
            };
            const validationResult = v.validate(data, schema);
            if (validationResult !== true) {
                res.status(400).json({
                message: "Validation Failed",
                data: validationResult,
                });
                return;
            }
            // Check if email is provided and exists for a different user
            if (data.email) {
                // Additional validation for email domain
                if (!/\b(?:gmail\.com|yahoo\.com|example\.com)\b/.test(data.email)) {
                res.status(400).json({
                    message:
                    "Invalid email domain. Supported domains: gmail.com, yahoo.com, example.com",
                });
                return;
                }
                User.findOne({
                where: {
                    email: data.email,
                    id: { [Op.not]: req.params.id },
                },
                })
                .then((existingUser) => {
                    if (existingUser) {
                    return res.status(400).json({
                        message: "Email already exists",
                    });
                    }
                    // Continue with the update
                    performUpdate();
                })
                .catch((err) => {
                    console.error("Database Error:", err);
                    res.status(500).json({
                    message: "Something went wrong",
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
                .then((result) => {
                    res.status(200).json({
                    message: "Success update data",
                    data: result,
                    });
                })
                .catch((err) => {
                    console.error("Update Error:", err);
                    res.status(500).json({
                    message: "Update Failed",
                    data: err,
                    });
                });
            }
            });
        });
        }

        //DELETE USER
        function destroy(req, res, next) {
        const data = {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: 1,
        };

        User.update(data, { where: { id: req.params.id } })
            .then((result) => {
            res.status(200).json({
                Message: "Success Delete Data",
                data: result,
            });
            })
            .catch((err) => {
            res.status(500).json({
                Message: `Delete Failed ${err}`,
                data: err,
            });
            });
        }

        //SIGNIN USER
        function signin(req, res, next) {
        const { username, email, password } = req.body;

        // Choose either email or username for login
        const loginField = email ? { email } : { username };

        User.findOne({ where: loginField })
            .then((user) => {
            if (user && !user.isDeleted) {
                bcrypt.compare(password, user.password, function (err, result) {
                if (result) {
                    // Pembuatan TOKEN saat login sukses
                    const token = jwt.sign(
                    {
                        email: user.email,
                        username: user.username,
                        userid: user.id,
                        role: user.role,
                    },
                    JWT_SECRET,
                    function (err, token) {
                        res.status(200).json({
                        status: "SUCCESS",
                        message: "Success login",
                        token: token,
                        });
                    }
                    );
                } else {
                    res.status(401).json({
                    status: "FAILED",
                    message: "Wrong Password",
                    data: err,
                    });
                }
                });
            } else {
                res.status(401).json({
                message: "User not found or has been deleted",
                });
            }
            })
            .catch((err) => {
            res.status(500).json({
                message: "Login Failed",
                data: err,
            });
            });
        }

        // SEARCH username BY NAME
        function searchByusername(req, res, next) {
        const searchTerm = req.query.q;
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;

        if (!searchTerm) {
            return res.status(400).json({
            message: "Search term is required",
            data: null,
            });
        }

        User.paginate({
            page: page,
            paginate: pageSize,
            where: {
            username: {
                [Op.like]: `%${searchTerm}%`,
            },
            },
        })
            .then((result) => {
            const response = {
                users: result.docs,
                total_count: result.total,
                total_pages: result.pages,
                current_page: result.page,
            };
            if (result.docs.length === 0) {
                res.status(404).json({
                message: "User not found",
                data: null,
                });
            } else {
                res.status(200).json({
                message: "Success",
                data: response,
                });
            }
            })
            .catch((err) => {
            res.status(500).json({
                message: "Search By Name Failed",
                data: err,
            });
            });
        }

        paginate.paginate(User);
        module.exports = {
        signup,
        read,
        update,
        destroy,
        signin,
        readbyid,
        searchByusername,
        };
