const express = require("express");
const { Recipe } = require("../models");
const { nanoid } = require("nanoid");
const { uploadToBucket } = require("../middlewares/gcsMiddleware");
const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require("sequelize");
const multer = require("multer");
const paginate = require("sequelize-paginate");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/recipes/images");
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

// CREATE RECIPE
function createRecipe(req, res, next) {
  const data = {
    id: nanoid(10),
    name: req.body.name,
    ingredient: req.body.ingredient,
    category: req.body.category,
    guide: req.body.guide,
    urlVideo: req.body.urlVideo,
    createdAt: new Date(),
  };

  const schema = {
    name: { type: "string", min: 5, max: 50, optional: false },
    ingredient: { type: "string", min: 5, max: 1200, optional: true },
    category: { type: "string", min: 3, max: 50, optional: true },
    guide: { type: "string", min: 5, max: 1200, optional: true },
    urlVideo: { type: "string", min: 5, max: 255, optional: true },
  };

  // VALIDASI DATA
  const validationResult = v.validate(data, schema);

  if (validationResult !== true) {
    res.status(400).json({
      message: "Validation Failed",
      data: validationResult,
    });
  } else {
    // If there is a file upload, update the image field
    if (req.file) {
      const destinationFolder = "recipes";
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
          // Update the image field with the file information
          data.image = fileInfo.imageUrl;
          // Create the recipe in the database with the prepared data
          createInDatabase();
        },
        destinationFolder
      );
    } else {
      // No file uploaded, directly create the recipe in the database
      createInDatabase();
    }
  }

  // Function to create the recipe in the database with the prepared data
  function createInDatabase() {
    Recipe.create(data)
      .then((result) => {
        res.status(200).json({
          message: "Success",
          data: result,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          message: "Create Recipe Failed",
          data: err,
        });
      });
  }
}


// READ ALL RECIPES
function readRecipes(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  Recipe.paginate({
    page: page,
    paginate: pageSize,
  })
    .then((result) => {
      const response = {
        recipe: result.docs,
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

// READ RECIPE BY ID
function readRecipeById(req, res, next) {
  const recipeId = req.params.id;

  // Check if the recipe with the given ID exists
  Recipe.findByPk(recipeId)
    .then((recipe) => {
      if (!recipe) {
        // If recipe is not found, return an error
        res.status(404).json({
          message: "Recipe not found",
          data: null,
        });
      } else {
        // If recipe exists, return the result
        res.status(200).json({
          message: "Success",
          data: recipe,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Read Recipe Failed",
        data: err,
      });
    });
}

// UPDATE RECIPE
function updateRecipe(req, res, next) {
  const data = {
    name: req.body.name,
    ingredient: req.body.ingredient,
    category: req.body.category,
    guide: req.body.guide,
    urlVideo: req.body.urlVideo,
    updatedAt: new Date(),
  };

  // Perform validation
  const schema = {
    name: { type: "string", min: 5, max: 50, optional: false },
    ingredient: { type: "string", min: 5, max: 255, optional: true },
    category: { type: "string", min: 3, max: 50, optional: true },
    guide: { type: "string", min: 5, max: 255, optional: true },
    urlVideo: { type: "string", min: 5, max: 255, optional: true },
  };

  const validationResult = v.validate(data, schema);
  if (validationResult !== true) {
    return res.status(400).json({
      message: "Validation Failed",
      data: validationResult,
    });
  }

  // If there is a file upload, update the image field
  if (req.file) {
    const destinationFolder = "recipes";
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
        // Update the image field with the file information
        data.image = fileInfo.imageUrl;
        // Update the database with the prepared data
        updateDatabase();
      },
      destinationFolder
    );
  } else {
    // No file uploaded, directly update the database
    updateDatabase();
  }

  // Function to update the database with the prepared data
  function updateDatabase() {
    Recipe.findByPk(req.params.id)
      .then((recipe) => {
        if (!recipe) {
          return res.status(404).json({
            message: "Recipe not found",
            data: null,
          });
        }

        const oldImage = recipe.image; // Store the old image URL

        // Update the recipe object with new data
        recipe
          .update(data)
          .then((result) => {
            // If there is an old image, delete it
            if (oldImage && req.file) {
              deleteOldImage(oldImage);
            }

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

  // Function to delete old image from Google Cloud Storage
  function deleteOldImage(oldImage) {
    const { bucket } = require("../middlewares/gcsMiddleware");
    // Get the file name from the old image URL
    const fileName = oldImage.split("/").pop();
    // Get the path in Google Cloud Storage
    const bucketFile = bucket.file(`public/recipes/images/${fileName}`);
    // Delete the file from Google Cloud Storage
    bucketFile
      .delete()
      .then(() => {
        console.log("Old image deleted successfully");
      })
      .catch((err) => {
        console.error("Error deleting old image:", err);
      });
  }
}

// DELETE RECIPE
function deleteRecipe(req, res, next) {
  const recipeId = req.params.id;

  // Check if the recipe with the given ID exists
  Recipe.findByPk(recipeId)
    .then((recipe) => {
      if (!recipe) {
        // If recipe is not found, return an error
        res.status(404).json({
          message: "Recipe not found",
          data: null,
        });
      } else {
        // If recipe exists, proceed with deletion
        Recipe.destroy({ where: { id: recipeId } })
          .then((result) => {
            res.status(200).json({
              message: "Success Delete Data",
              data: result,
            });
          })
          .catch((err) => {
            res.status(500).json({
              message: "Delete Recipe Failed",
              data: err,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error checking recipe existence",
        data: err,
      });
    });
}

// SEARCH RECIPE BY NAME
function searchRecipeByName(req, res, next) {
  const searchTerm = req.query.q;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;

  if (!searchTerm) {
    return res.status(400).json({
      message: "Search term is required",
      data: null,
    });
  }

  Recipe.paginate({
    page: page,
    paginate: pageSize,
    where: {
      name: {
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
          message: "Recipe not found",
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
        message: "Search By recipe Failed",
        data: err,
      });
    });
}

paginate.paginate(Recipe);

module.exports = {
  createRecipe,
  readRecipes,
  readRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipeByName,
};
