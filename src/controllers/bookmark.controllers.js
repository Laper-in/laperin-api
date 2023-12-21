const { bookmark, recipe } = require("../database/models");
const { Op } = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();
const paginate = require("sequelize-paginate");

async function createBookmark(req, res, next) {
  // const userId = req.user.userId; // Extract user ID from JWT
  const data = {
    idUser: req.user.userId,
    idRecipe: req.body.idRecipe,
    createdAt: new Date(),
  };
  if (req.user.userId !== data.idUser) {
    return res
      .status(403)
      .json({ message: "Forbidden: User IDs do not match" });
  }
  const schema = {
    idUser: { type: "string", min: 5, max: 50, optional: false },
    idRecipe: { type: "string", min: 1, max: 50, optional: false },
  };
  const validationResult = v.validate(data, schema);
  if (validationResult !== true) {
    res.status(400).json({
      message: "Validation Failed",
      data: validationResult,
    });
  } else {
    try {
      const existingBookmark = await bookmark.findOne({
        where: {
          idUser: data.idUser,
          idRecipe: data.idRecipe,
        },
      });

      if (existingBookmark) {
        return res.status(400).json({
          message: "Bookmark with the same idUser and idRecipe already exists",
        });
      }
      const result = await bookmark.create(data);
      res.status(201).json({
        message: "Bookmark Created Successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Create Bookmark Failed",
      });
    }
  }
}
function mergeCategories(categories) {
  return [...new Set(categories)].join(", ");
}

async function getAllBookmarksCategoryByUserId(req, res, next) {
  const userId = req.user.userId;
  try {
    const bookmarks = await bookmark.findAll({
      where: { idUser: userId },
    });
    const idRecipes = bookmarks.map((bookmark) => bookmark.idRecipe);
    if (idRecipes.length === 0) {
      res.status(200).json({
        message: "Read bookmarks success",
      });
      return;
    }
    const recipesData = await recipe.findAll({
      where: {
        id: {
          [Op.in]: idRecipes,
        },
      },
    });

    const uniqueCategories = new Set();

    const bookmarksWithRecipes = bookmarks.map((bookmark) => {
      const correspondingRecipe = recipesData.find(
        (recipe) => recipe.id === bookmark.idRecipe
      );

      if (correspondingRecipe) {
        const categories = correspondingRecipe.category.split(",");
        categories.forEach((category) => uniqueCategories.add(category));
      }

      return null;
    });

    const response = {
      data: mergeCategories([...uniqueCategories]),
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
    });
  }
}
async function searchAllBookmarkByCategory(req, res, next) {
  const userId = req.user.userId;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const category = req.query.category;

  try {
    const categoryCondition = category
      ? {
          category: {
            [Op.like]: `%${category}%`,
          },
        }
      : {};
    const { count, rows: bookmarks } = await bookmark.findAndCountAll({
      where: { idUser: userId },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    let recipesData;
    if (category) {
      recipesData = await recipe.findAll({
        where: {
          id: {
            [Op.in]: bookmarks.map((bookmark) => bookmark.idRecipe),
          },
          ...categoryCondition,
        },
      });
    } else {
      recipesData = await recipe.findAll({
        where: {
          id: {
            [Op.in]: bookmarks.map((bookmark) => bookmark.idRecipe),
          },
        },
      });
    }
    const bookmarksWithRecipes = bookmarks
      .map((bookmark) => {
        const correspondingRecipe = recipesData.find(
          (recipe) => recipe.id === bookmark.idRecipe
        );
        return correspondingRecipe
          ? {
              bookmark: bookmark,
              recipe: correspondingRecipe,
            }
          : null;
      })
      .filter(Boolean);

    const response = {
      message: "Search bookmarks by category success",
      total_count: bookmarksWithRecipes.length,
      total_pages: 1,
      current_page: 1,
      data: bookmarksWithRecipes,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Read bookmarks failed",
    });
  }
}
async function deleteBookmark(req, res, next) {
  const bookmarkId = req.params.id;

  try {
    const foundBookmark = await bookmark.findOne({
      where: { idBookmark: bookmarkId, idUser: req.user.userId },
    });

    if (!foundBookmark) {
      return res.status(404).json({
        message: "Bookmark not found or unauthorized",
      });
    }
    await foundBookmark.destroy();
    res.status(200).json({
      message: "Bookmark deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Delete bookmark failed",
    });
  }
}

paginate.paginate(bookmark);

module.exports = {
  createBookmark,
  getAllBookmarksCategoryByUserId,
  deleteBookmark,
  searchAllBookmarkByCategory,
};
