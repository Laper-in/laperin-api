const { Donation } = require("../models");
const { nanoid } = require("nanoid");
const Validator = require("fastest-validator");
const v = new Validator();
const { auth } = require("../middlewares/auth");
const { uploadToBucket } = require("../middlewares/gcsMiddleware");
const paginate = require("sequelize-paginate");
const multer = require("multer");
const geolib = require('geolib');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/donations/images");
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

// CREATE DONATION
function createDonation(req, res, next) {
    const data = {
        idDonation: nanoid(10),
        idUser: req.body.idUser,
        username: req.body.username,
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        total: req.body.total,
        image: req.file ? req.file.filename : req.body.image,
        lon: req.body.lon,
        lat: req.body.lat,
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
        username: { type: "string", min: 5, max: 50, optional: true },
        name: { type: "string", min: 5, max: 255, optional: true },
        description: { type: "string", optional: true },
        category: { type: "string", min: 5, max: 255, optional: true },
    };

    // VALIDASI DATA
    const validationResult = v.validate(data, schema);

    if (validationResult !== true) {
        res.status(400).json({
            message: "Validation Failed",
            data: validationResult,
        });
    } else {
        // If there is a file upload, upload it to GCS
        if (req.file) {
            const destinationFolder = "donations";
            uploadToBucket(
                req.file,
                (err, fileInfo) => {
                    console.log("File uploaded to GCS:", fileInfo);
                    if (err) {
                        return res.status(500).json({
                            message: "File upload to GCS failed",
                            data: err,
                        });
                    }
                    // Update the image field with the file information
                    data.image = fileInfo.imageUrl;
                    // Continue with donation creation
                    createDonationInDatabase();
                },
                destinationFolder
            );
        } else {
            // No file uploaded, directly create the donation in the database
            createDonationInDatabase();
        }
    }
    // Function to create the donation in the database
    function createDonationInDatabase() {
        Donation.create(data)
            .then((result) => {
                res.status(201).json({
                    message: "Donation Created Successfully",
                    data: result,
                });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({
                    message: "Create Donation Failed",
                    data: err,
                });
            });
    }
}
function readDonation(req, res, next) {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    // Convert latitude and longitude to numbers
    const userLat = parseFloat(req.params.lat);
    const userLon = parseFloat(req.params.lon);

    // Fetch all donations from the database
    Donation.findAll()
        .then((donations) => {
            // Paginate the donations
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedDonations = donations.slice(startIndex, endIndex);

            // Return the paginated donations with distance
            const response = {
                donations: paginatedDonations.map((donation) => {
                    return {
                        ...donation.dataValues,
                        distance: geolib.getDistance(
                            { latitude: userLat, longitude: userLon },
                            { latitude: parseFloat(donation.lat), longitude: parseFloat(donation.lon) }
                        ),
                    };
                }),
                total_count: donations.length,
                total_pages: Math.ceil(donations.length / pageSize),
                current_page: page,
            };

            res.status(200).json(response);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: 'Error fetching donations', error: err });
        });
}

function readClosestDonation(req, res, next) {
    const userLon = parseFloat(req.params.lon);
    const userLat = parseFloat(req.params.lat);

    // Fetch all donations from the database
    Donation.findAll()
        .then((donations) => {
            // Calculate distances from the user's location to each donation
            const donationsWithDistances = donations.map((donation) => {
                const distance = geolib.getDistance(
                    { latitude: userLat, longitude: userLon },
                    { latitude: donation.lat, longitude: donation.lon }
                );

                return { donation: { ...donation.dataValues, distance }, distance };
            });

            // Sort the donations based on distance in ascending order (closest first)
            const sortedDonations = donationsWithDistances.sort((a, b) => a.distance - b.distance);

            // Paginate the sorted donations
            const page = parseInt(req.query.page, 10) || 1;
            const pageSize = parseInt(req.query.pageSize, 10) || 10;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedDonations = sortedDonations.slice(startIndex, endIndex);

            // Return the paginated closest donation with distance
            const response = {
                closestDonations: paginatedDonations.map((item) => item.donation),
                total_count: sortedDonations.length,
                total_pages: Math.ceil(sortedDonations.length / pageSize),
                current_page: page,
            };

            res.status(200).json(response);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: 'Error fetching closest donation', error: err });
        });
}

// READ DONATIONS
function readAllDonationsByUserId(req, res, next) {
    const userid = req.params.id;

    // Check if the user ID in the JWT matches the requested user ID
    if (req.user.userid !== userid) {
        return res
            .status(403)
            .json({ message: "Forbidden: User IDs do not match" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    Donation.findAndCountAll({
        where: { idUser: userid },
        limit: pageSize,
        offset: (page - 1) * pageSize,
    })
        .then((result) => {
            const response = {
                donations: result.rows,
                total_count: result.count,
                total_pages: Math.ceil(result.count / pageSize),
                current_page: page,
            };

            res.status(200).json(response);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                message: "Read donations failed",
                data: err,
            });
        });
}

// SOFT DELETE DONATION
function deleteDonation(req, res, next) {
    const donationId = req.params.id;
    if (!req.user || !req.user.userid) {
        return res.status(401).json({
            message: "Unauthorized. User information not available.",
        });
    }
    Donation.update(
        { isDeleted: 1, deletedAt: new Date(), deletedBy: req.user.userid },
        { where: { idDonation: donationId, idUser: req.user.userid } }
    )
        .then((updatedRows) => {
            if (updatedRows > 0) {
                res.status(200).json({
                    message: "Donation marked as deleted successfully",
                    data: null,
                });
            } else {
                res.status(404).json({
                    message: "Donation not found or unauthorized",
                    data: null,
                });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                message: "Soft delete donation failed",
                data: err,
            });
        });
}

paginate.paginate(Donation);

module.exports = {
    createDonation,
    readAllDonationsByUserId,
    deleteDonation,
    readDonation,
    readClosestDonation,
};
