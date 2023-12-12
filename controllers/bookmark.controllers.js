    const { bookmark } = require("../models");
    const { nanoid } = require("nanoid");
    const Validator = require("fastest-validator");
    const v = new Validator();
    const { auth } = require("../middlewares/auth");
    const paginate = require("sequelize-paginate");

    // CREATE BOOKMARK
    function createBookmark(req, res, next) {
    const data = {
        idBookmark: nanoid(10),
        idUser: req.body.idUser,
        idRecipe: req.body.idRecipe,
        createdAt: new Date(),
    };

    // Check if the user ID in the JWT matches the user ID in the request body
    if (req.user.userid !== data.idUser) {
        return res
        .status(403)
        .json({ message: "Forbidden: User IDs do not match" });
    }

    const schema = {
        idUser: { type: "string", min: 5, max: 50, optional: true },
        idRecipe: { type: "string", min: 5, max: 50, optional: true },
    };

    // VALIDASI DATA
    const validationResult = v.validate(data, schema);

    if (validationResult !== true) {
        res.status(400).json({
        message: "Validation Failed",
        data: validationResult,
        });
    } else {
        bookmark.create(data)
        .then((result) => {
            res.status(201).json({
            message: "Bookmark Created Successfully",
            data: result,
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
            message: "Create Bookmark Failed",
            data: err,
            });
        });
    }
    }

    // READ BOOKMARKS
    function readAllBookmarksByUserId(req, res, next) {
    const userid = req.params.id;

    // Check if the user ID in the JWT matches the requested user ID
    if (req.user.userid !== userid) {
        return res
        .status(403)
        .json({ message: "Forbidden: User IDs do not match" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    bookmark.findAndCountAll({
        where: { idUser: userid },
        limit: pageSize,
        offset: (page - 1) * pageSize,
    })
        .then((result) => {
        const response = {
            bookmarks: result.rows,
            total_count: result.count,
            total_pages: Math.ceil(result.count / pageSize),
            current_page: page,
        };

        res.status(200).json(response);
        })
        .catch((err) => {
        console.error(err);
        res.status(500).json({
            message: "Read bookmarks failed",
            data: err,
        });
        });
    }

    // DELETE BOOKMARK
    function deleteBookmark(req, res, next) {
    const bookmarkId = req.params.id;

    // Check if req.user is defined and has a userid property
    if (!req.user || !req.user.userid) {
        return res.status(401).json({
        message: "Unauthorized. User information not availaable.",
        });
    }

    // Delete the bookmark based on idBookmark
    bookmark.destroy({
        where: { idBookmark: bookmarkId, idUser: req.user.userid },
    })
        .then((deletedRows) => {
        if (deletedRows > 0) {
            res.status(200).json({
            message: "Bookmark deleted successfully",
            data: null,
            });
        } else {
            res.status(404).json({
            message: "Bookmark not found or unauthorized",
            data: null,
            });
        }
        })
        .catch((err) => {
        console.error(err);
        res.status(500).json({
            message: "Delete bookmark failed",
            data: err,
        });
        });
    }

    paginate.paginate(bookmark);

    module.exports = {
    createBookmark,
    readAllBookmarksByUserId,
    deleteBookmark,
    };
