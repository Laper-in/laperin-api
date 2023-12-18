const { recipe } = require("../models");
const { nanoid } = require("nanoid");
const { Op } = require("sequelize");
const {
  uploadToBucket,
  bucket,
  uploadVideoToBucket,
} = require("../middlewares/gcsMiddleware");
const {
  generateAccessToken,
  clearToken,
  authData,
  isUserOwner,
  isDonationOwner,
  isAdmin,
  isUserDeleted,
} = require("../middlewares/auth");
const Validator = require("fastest-validator");
const v = new Validator();
const paginate = require("sequelize-paginate");
// CREATE RECIPE
async function createRecipe(req, res, next) {
  try {
    const data = {
      id: nanoid(10),
      name: req.body.name,
      ingredient: req.body.ingredient,
      description: req.body.description,
      category: req.body.category,
      guide: req.body.guide,
      time: req.body.time,
      createdAt: new Date(),
    };

    const schema = {
      name: { type: "string", min: 5, max: 50, optional: true },
      ingredient: { type: "string", min: 5, max: 1200, optional: true },
      description: { type: "string", min: 5, max: 1200, optional: true },
      category: { type: "string", min: 5, max: 20, optional: true },
      guide: { type: "string", min: 5, max: 1200, optional: true },
      time: { type: "string", optional: true },
      video: { type: "string", max: 255, optional: true },
    };

    // VALIDATE DATA
    const validationResult = v.validate(data, schema);

    if (validationResult !== true) {
      return res.status(400).json({
        message: "Validation Failed",
        data: validationResult,
      });
    }

    // If there is an image file upload, upload it to GCS
    if (req.files["image"]) {
      const imageDestinationFolder = "recipe";
      const imageFileInfo = await new Promise((resolve, reject) => {
        uploadToBucket(
          req.files["image"][0],
          (err, fileInfo) => {
            if (err) {
              reject(err);
            } else {
              resolve(fileInfo);
            }
          },
          imageDestinationFolder
        );
      });
      console.log("Image uploaded to GCS:", imageFileInfo);
      data.image = imageFileInfo.imageUrl;
    }

    // If there is a video file upload, upload it to GCS
    if (req.files["video"]) {
      const videoDestinationFolder = "recipes";
      const videoFileInfo = await new Promise((resolve, reject) => {
        uploadVideoToBucket(
          req.files["video"][0],
          (err, fileInfo) => {
            if (err) {
              reject(err);
            } else {
              resolve(fileInfo);
            }
          },
          videoDestinationFolder
        );
      });
      console.log("Video uploaded to GCS:", videoFileInfo);
      data.video = videoFileInfo.videoUrl;
    }

    const result = await recipe.create(data);

    res.status(201).json({
      message: "Recipe Created Successfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Create Recipe Failed",
      data: err,
    });
  }
}
// READ ALL RECIPE
async function getAllRecipe(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await recipe.paginate({
      page: page,
      paginate: pageSize,
    });

    const response = {
      message: "Success fetch recipe",
      total_count: result.total,
      total_pages: result.pages,
      current_page: result.page,
      data: result.docs,
    };

    res.send(response);
  } catch (err) {
    res.status(500).send(err);
  }
}
// READ RECIPE BY ID
async function getDetailRecipe(req, res, next) {
  try {
    const recipeId = req.params.id;

    // Check if the recipe with the given ID exists
    const recipes = await recipe.findByPk(recipeId);

    if (!recipes) {
      // If recipe is not found, return an error
      res.status(404).json({
        message: "Recipe not found",
        data: null,
      });
    } else {
      // If recipe exists, return the result
      res.status(200).json({
        message: "Success",
        data: recipes,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Read Recipe Failed",
      data: err.toString(),
    });
  }
}
// UPDATE RECIPE
function updateRecipe(req, res, next) {
  const data = {
    name: req.body.name,
    ingredient: req.body.ingredient,
    category: req.body.category,
    guide: req.body.guide,
    urlVideo: req.body.urlVideo,
    image: req.file ? req.file.filename : req.body.image,
    updatedAt: new Date(),
  };

  const schema = {
    name: { type: "string", min: 5, max: 50, optional: false },
    ingredient: { type: "string", min: 5, max: 255, optional: true },
    category: { type: "string", min: 3, max: 50, optional: true },
    guide: { type: "string", min: 5, max: 255, optional: true },
    urlVideo: { type: "string", min: 5, max: 255, optional: true },
    image: { type: "string", optional: true },
  };

  // VALIDASI DATA
  const validationResult = v.validate(data, schema);

  if (validationResult !== true) {
    // Data tidak valid
    res.status(400).json({
      message: "Validation Failed",
      data: validationResult,
    });
  } else {
    // Update recipe jika data valid
    recipe
      .update(data, { where: { id: req.params.id } })
      .then((result) => {
        res.status(200).json({
          message: "Success update data",
          data: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Update Recipe Failed",
          data: err,
        });
      });
  }
}
// DELETE RECIPE
async function deleteRecipe(req, res, next) {
  try {
    const recipeId = req.params.id;

    // Check if the recipe with the given ID exists
    const existingRecipe = await Recipe.findByPk(recipeId);

    if (!existingRecipe) {
      // If recipe is not found, return an error
      res.status(404).json({
        message: "Recipe not found",
        data: null,
      });
      return;
    }

    // If recipe exists, proceed with deletion
    const result = await Recipe.destroy({ where: { id: recipeId } });

    res.status(200).json({
      message: "Success Delete Data",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      message: "Delete Recipe Failed",
      data: err.toString(),
    });
  }
}
// SEARCH RECIPE BY NAME
async function searchRecipeByName(req, res, next) {
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

    const result = await recipe.paginate({
      page: page,
      paginate: pageSize,
      where: searchQuery,
      order: [['name', 'ASC']], // Sort by name in ascending order
    });

    const response = {
      message: "Success fetch recipe by name",
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
      message: "Search By Recipe Name Failed",
    });
  }
}

async function searchRecipeById(req, res, next) {
  const recipeIds = req.query.ids; // Assuming the IDs are provided as a comma-separated string
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;

  try {
    // Convert the comma-separated string into an array of string IDs
    const idArray = recipeIds.split(',');

    let searchQuery = {};
    if (idArray.length > 0) {
      searchQuery = {
        id: {
          [Op.in]: idArray,
        },
      };
    }

    const result = await recipe.paginate({
      page: page,
      paginate: pageSize,
      where: searchQuery,
      order: [['name', 'ASC']], 
    });

    const response = {
      message : "Success fetch recipe by id",
      total_count: result.total,
      total_pages: result.pages,
      current_page: result.page,
      data: result.docs,
    };

    if (result.docs.length === 0) {
      res.status(404).json({
        message: "Recipes not found",
      });
    } else {
      res.status(200).json(response);
    }
  } catch (err) {
    res.status(500).json({
      message: "Search By Recipe IDs Failed",
    });
  }
}

async function searchRecipeByCategory(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const category = req.query.q;

  try {
    const categoryCondition = category ? {
      category: {
        [Op.like]: `%${category}%`,
      },
    } : {};
    console.log('Input category:', category);


    const { count, rows: recipes } = await recipe.findAndCountAll({
      where: {
        ...categoryCondition,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: "Search recipes by category success",
      total_count: count,
      total_pages: Math.ceil(count / pageSize),
      current_page: page,
      data: recipes,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Read recipes failed",
    });
  }
}
async function searchRecipeByIngredient(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const ingredient = req.query.q;

  try {
    const ingredientsCondition = ingredient ? {
      ingredient: {
        [Op.like]: `%${ingredient}%`,
      },
    } : {};
    console.log('Input ingredients:', ingredient);

    const { count, rows: recipes } = await recipe.findAndCountAll({
      where: {
        ...ingredientsCondition,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: "Search recipes by ingredients success",
      total_count: count,
      total_pages: Math.ceil(count / pageSize),
      current_page: page,
      data: recipes,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Read recipes failed",
    });
  }
}
paginate.paginate(recipe);

module.exports = {
  createRecipe,
  getAllRecipe,
  getDetailRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipeByName,
  searchRecipeById,
  searchRecipeByCategory,
  searchRecipeByIngredient,
};
