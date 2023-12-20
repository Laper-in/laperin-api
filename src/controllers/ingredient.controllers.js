const { ingredient } = require("../database/models");
const { nanoid } = require("nanoid");
const Validator = require("fastest-validator");
const { Op } = require("sequelize");
const { uploadToBucket, bucket } = require("../middlewares/gcsMiddleware");
const v = new Validator();
const paginate = require("sequelize-paginate");
const { isAdmin } = require("../middlewares/auth");

async function createIngredient(req, res, next) {
  try {
    const data = {
      id: nanoid(10),
      name: req.body.name,
    };

    const schema = {
      name: { type: "string", min: 3, max: 50, optional: false },
    };
    // VALIDATE DATA
    const validationResult = v.validate(data, schema);
    if (validationResult !== true) {
      return res.status(400).json({
        message: "Validation Failed",
        data: validationResult,
      });
    }
    // If there is a file upload, upload it to GCS
    if (req.file) {
      const destinationFolder = "ingredients";
      const fileInfo = await new Promise((resolve, reject) => {
        uploadToBucket(
          req.file,
          (err, fileInfo) => {
            if (err) {
              reject(err);
            } else {
              resolve(fileInfo);
            }
          },
          destinationFolder
        );
      });

      console.log("File uploaded to GCS:", fileInfo);

      // Update the image field with the file information
      data.image = fileInfo.imageUrl;
    }

    // Create the ingredient in the database
    const result = await ingredient.create(data);

    res.status(201).json({
      message: "Ingredient Created Successfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Create Ingredient Failed",
    });
  }
}
async function getAllIngredient(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;

  try {
    const result = await ingredient.findAndCountAll({
      order: [["name", "ASC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: "Success Get All Ingredients",
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
}
async function updateIngredient(req, res, next) {
  const ingredientId = req.params.id;

  const data = {
    name: req.body.name,
  };

  try {
    await isAdmin(req, res, async () => {
      const result = await validateAndUpdate();

      res.status(200).json({
        message: "Update Ingredient Success",
        data: result,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Update Failed",
    });
  }

  // Function to perform the validation and update
  async function validateAndUpdate() {
    const schema = {
      name: { type: "string", optional: true },
    };
    const validationResult = v.validate(data, schema);
    if (validationResult !== true) {
      throw {
        message: "Validation Failed",
        data: validationResult,
      };
    }

    // If there is a file upload, update the image field
    if (req.file) {
      const destinationFolder = "ingredients";
      const fileInfo = await new Promise((resolve, reject) => {
        uploadToBucket(
          req.file,
          (err, fileInfo) => {
            if (err) {
              reject(err);
            } else {
              resolve(fileInfo);
            }
          },
          destinationFolder
        );
      });
      console.log("File uploaded to bucket:", fileInfo);
      data.image = fileInfo.imageUrl;
    }

    return updateDatabase();
  }

  // Function to update the database with the prepared data
  async function updateDatabase() {
    const ingredientObj = await ingredient.findByPk(ingredientId);
    if (!ingredientObj) {
      throw {
        message: "Ingredients not found",
      };
    }

    // Save the old image URL for deletion
    const oldImageUrl = ingredientObj.image;
    const result = await ingredientObj.update(data);
    await deleteOldImage(oldImageUrl);
    const updateIngredient = await ingredient.findByPk(ingredientId);
    return updateIngredient;
  }

  // Function to delete old image from Google Cloud Storage
  async function deleteOldImage(oldImageUrl) {
    if (!oldImageUrl || !data.image) {
      // Jika tidak ada gambar lama atau tidak ada gambar baru, keluar dari fungsi
      return;
    }

    const fileName = oldImageUrl.split("/").pop();
    const bucketFile = bucket.file(`public/ingredients/images/${fileName}`);

    try {
      await bucketFile.delete();
      console.log("Old image deleted successfully");
    } catch (err) {
      console.error("Error deleting old image:", err);
    }
  }
}
async function deleteIngredient(req, res, next) {
  const ingredientId = req.params.id;

  try {
    const existingIngredient = await ingredient.findByPk(ingredientId);
    if (!existingIngredient) {
      res.status(404).json({
        message: "Ingredient not found",
      });
    } else {
      const result = await ingredient.destroy({ where: { id: ingredientId } });
      res.status(200).json({
        message: "Success Delete Ingredient",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Delete Ingredient Failed",
    });
  }
}
async function searchIngredientByName(req, res, next) {
  const searchTerm = req.query.q;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  try {
    let searchQuery = {};
    if (searchTerm) {
      searchQuery = {
        name: {
          [Op.like]: `%${searchTerm}%`,
        },
      };
    }
    const result = await ingredient.paginate({
      page: page,
      paginate: pageSize,
      where: searchQuery,
      order: [["name", "ASC"]], // Sort by name in ascending order
    });
    const response = {
      message: "Success Get All Ingredients By Name",
      total_count: result.total,
      total_pages: result.pages,
      current_page: result.page,
      data: result.docs,
    };
    if (result.docs.length === 0) {
      res.status(404).json({
        message: "Recipe not found",
      });
    } else {
      res.status(200).json(response);
    }
  } catch (err) {
    res.status(500).json({
      message: "Search By Ingredient Failed",
    });
  }
}

paginate.paginate(ingredient);
module.exports = {
  createIngredient,
  getAllIngredient,
  updateIngredient,
  deleteIngredient,
  updateIngredient,
  searchIngredientByName,
};
