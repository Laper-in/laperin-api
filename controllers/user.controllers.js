const e = require("express");
const { user } = require("../models");
const { uploadToBucket } = require("../middlewares/gcsMiddleware");
require("dotenv").config();
const { nanoid } = require("nanoid");
const Validator = require("fastest-validator");
const { Op } = require("sequelize");
const v = new Validator();
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const paginate = require("sequelize-paginate");

//CREATE USER
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
  const data = {
    email: req.body.email,
    fullname: req.body.fullname,
    alamat: req.body.alamat,
    telephone: req.body.telephone,
    updatedAt: new Date(),
    updatedBy: 0,
  };

  // Check if the password field is provided
  if (req.body.password) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        console.error("Salt Generation Error:", err);
        return next(err); // Stop further execution on salt generation error
      }

      bcrypt.hash(req.body.password, salt, function (err, hashedPassword) {
        if (err) {
          console.error("Hashing Error:", err);
          return res.status(500).json({
            message: "Password hashing failed",
            data: err,
          });
        }

        data.password = hashedPassword; // Set the hashed password in the data object

        // Continue with the validation and update
        validateAndUpdate();
      });
    });
  } else {
    // No password provided, proceed with the validation and update
    validateAndUpdate();
  }

  // Function to perform the validation and update
  function validateAndUpdate() {
    const schema = {
      email: { type: "email", optional: true },
      password: { type: "string", min: 5, max: 255, optional: true },
    };

    const validationResult = v.validate(data, schema);
    if (validationResult !== true) {
      return res.status(400).json({
        message: "Validation Failed",
        data: validationResult,
      });
    }

    // If there is a file upload, update the pictureUrl field
    if (req.file) {
      const destinationFolder = "users"; 
      uploadToBucket(
        req.file,
        (err, fileInfo) => {
          console.log("File uploaded upload bucket:", fileInfo);
          if (err) {
            return res.status(500).json({
              message: "File upload to GCS failed",
              data: err,
            });
          }
          // Update the pictureUrl field with the file information
          data.picture = fileInfo.imageUrl;
          // Update the database with the prepared data
          updateDatabase();
        },
        destinationFolder
      );
    } else {
      // No file uploaded, directly update the database
      updateDatabase();
    }
  }
  // Function to update the database with the prepared data
  function updateDatabase() {
    User.findByPk(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            message: "User not found",
            
          });
        }
        // Simpan URL gambar lama untuk dihapus
        const oldPictureUrl = user.picture;
        // Update the user object with new data
        user
          .update(data)
          .then((result) => {
            deleteOldPicture(oldPictureUrl);
            res.status(200).json({
              message: "Success update data",
            
            });
          })
          .catch((err) => {
            console.error("Update Error:", err);
            res.status(500).json({
              message: "Update Failed",
              data: err,
            });
          });
      })
      .catch((err) => {
        console.error("Database Error:", err);
        res.status(500).json({
          message: "Something went wrong",
          data: err,
        });
      });
  }
  // Function to delete old picture from Google Cloud Storage
  function deleteOldPicture(oldPictureUrl) {
    if (!oldPictureUrl) {
      return;
    }
    // Mendapatkan nama file dari URL gambar lama
    const fileName = oldPictureUrl.split("/").pop();
    const bucketFile = bucket.file(`public/users/media/images/${fileName}`);
    bucketFile
      .delete()
      .then(() => {
        console.log("Old picture deleted successfully");
      })
      .catch((err) => {
        console.error("Error deleting old picture:");
      });
  } // Function to update the database with the prepared data
  function updateDatabase() {
    User.findByPk(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            message: "User not found",
            data: null,
          });
        }
        const oldPictureUrl = user.picture;
        user
          .update(data)
          .then((result) => {
            deleteOldPicture(oldPictureUrl);
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
      })
      .catch((err) => {
        console.error("Database Error:", err);
        res.status(500).json({
          message: "Something went wrong",
          data: err,
        });
      });
  }
  // Function to delete old picture from Google Cloud Storage
  function deleteOldPicture(oldPictureUrl) {
    // Jika tidak ada URL gambar lama, keluar
    if (!oldPictureUrl) {
      return;
    }
    const { bucket } = require("../middlewares/gcsMiddleware");
    // Mendapatkan nama file dari URL gambar lama
    const fileName = oldPictureUrl.split("/").pop();
    // Mendapatkan path di Google Cloud Storage
    const bucketFile = bucket.file(`public/users/media/images/${fileName}`);
    // Menghapus file dari Google Cloud Storage
    bucketFile
      .delete()
      .then(() => {
        console.log("Old picture deleted successfully");
      })
      .catch((err) => {
        console.error("Error deleting old picture:", err);
      });
  }
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
paginate.paginate(user);
module.exports = {
  signup,
  read,
  update,
  destroy,
  signin,
  readbyid,
  searchByusername,
};
