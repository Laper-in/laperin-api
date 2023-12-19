const { donation } = require("../database/models");
const { nanoid } = require("nanoid");
const { uploadToBucket ,bucket } = require("../middlewares/gcsMiddleware");
const {
  generateAccessToken, clearToken, authData, isUserOwner,isDonationOwner, isAdmin,isUserDeleted,
} = require('../middlewares/auth');
const Validator = require("fastest-validator");
const v = new Validator();
const paginate = require("sequelize-paginate");
const geolib = require('geolib');
const { Op } = require("sequelize");


async function createDonation(req, res, next) {
  try {
    const userId = req.user.userId;
    const username = req.user.username;
    const data = {
      idDonation: nanoid(10),
      idUser: userId,
      username: username  ,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      total: req.body.total,
      image: req.file ? req.file.filename : req.body.image,
      lon: req.body.lon,
      lat: req.body.lat,
      createdAt: new Date(),
    };

    const schema = {
      idUser: { type: "string", min: 5, max: 50, optional: true },
      username: { type: "string", min: 5, max: 50, optional: false },
      name: { type: "string", min: 5, max: 255, optional: true },
      description: { type: "string", optional: true },
      category: { type: "string", min: 5, max: 255, optional: true },
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
      const destinationFolder = "donations";
      const fileInfo = await new Promise((resolve, reject) => {
        uploadToBucket(req.file, (err, fileInfo) => {
          if (err) {
            reject(err);
          } else {
            resolve(fileInfo);
          }
        }, destinationFolder);
      });

      console.log("File uploaded to GCS:", fileInfo);

      // Update the image field with the file information
      data.image = fileInfo.imageUrl;
    }

    // Create the donation in the database
    await donation.create(data);

    res.status(201).json({
      message: "Donation Created Successfully",
      // data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Create Donation Failed",
      data: err,
    });
  }
}
async function getAllDonation(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    // Convert latitude and longitude to numbers
    const userLat = parseFloat(req.params.lat);
    const userLon = parseFloat(req.params.lon);

    // Fetch all donations from the database
    const donations = await donation.findAll({ where: { isDone: 0 } });

    // Paginate the donations
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDonations = donations.slice(startIndex, endIndex);

    // Return the paginated donations with distance
    const response = {
      message: "Success fetching donations",
      total_count: donations.length,
      total_pages: Math.ceil(donations.length / pageSize),
      current_page: page,
      data: paginatedDonations.map((donation) => {
        return {
          ...donation.dataValues,
          distance: geolib.getDistance(
            { latitude: userLat, longitude: userLon },
            { latitude: parseFloat(donation.lat), longitude: parseFloat(donation.lon) }
          ),
        };
      }),
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching donations', error: err });
  }
}
async function getAllClosestDonation(req, res, next) {
  try {
    const userIdFromToken = req.user.userId;
    const requestedUserId = userIdFromToken; 

    const userLon = parseFloat(req.params.lon);
    const userLat = parseFloat(req.params.lat);

    const donations = await donation.findAll({
      where: {
        isDone: 0,
        idUser: { [Op.ne]: requestedUserId }
      }
    });
    // Calculate distances from the user's location to each donation
    const donationsWithDistances = donations.map((donation) => {
      // Log values for debugging
      console.log('User Location:', { latitude: userLat, longitude: userLon });
      console.log('Donation Location:', { latitude: donation.lat, longitude: donation.lon });

      // Check for null values
      if (donation.lat === null || donation.lon === null) {
        console.log('Skipping donation due to null coordinates');
        return null;
      }
      
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        { latitude: donation.lat, longitude: donation.lon }
      );

      return { donation: { ...donation.dataValues, distance }, distance };
    });

    // Remove null entries
    const validDonationsWithDistances = donationsWithDistances.filter(Boolean);

    // Sort the donations based on distance in ascending order (closest first)
    const sortedDonations = validDonationsWithDistances.sort((a, b) => a.distance - b.distance);

    // Paginate the sorted donations
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDonations = sortedDonations.slice(startIndex, endIndex);

    // Return the paginated closest donation with distance
    const response = {
      message: "Success fetching closest donations",
      total_count: sortedDonations.length,
      total_pages: Math.ceil(sortedDonations.length / pageSize),
      current_page: page,
      data: paginatedDonations.map((item) => item.donation),
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching closest donation', error: err });
  }
}
async function getAllDonationByUserId(req, res, next) {
  try {
    const userIdFromToken = req.user.userId;
    const requestedUserId = userIdFromToken; 

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await donation.findAndCountAll({
      where: { idUser: requestedUserId },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: "Success fetching donations by user ID",
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Read donations failed",
      data: err,
    });
  }
}
async function getDetailDonation(req, res, next) {
  try {
    const donationId = req.params.id;

    const donationInstance = await donation.findByPk(donationId);

    if (!donationInstance) {
      res.status(404).json({
        message: "Donation not found",
        data: null,
      });
    } else {
      res.status(200).json({
        message: "Success fetching donation detail",
        data: donationInstance,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Read Donation Failed",
      data: err,
    });
  }
}
async function deleteDonation(req, res, next) {
  const donationId = req.params.id || req.query.id;
  const userId = req.user.userId; 
  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized. User information not available.",
    });
  }
  console.log('Deleting donation with id:', donationId);
  donation.update(
    { isDone: 1, deletedAt: new Date(), deletedBy: userId },
    { where: { idDonation: donationId, idUser: userId } }
  ).then((updatedRows) => {
    if (updatedRows[0] > 0) {
      res.status(200).json({
        message: "Donation marked as deleted successfully",
      });
    } else {
      res.status(404).json({
        message: "Donation not found or unauthorized",
      });
    }
  }).catch((err) => {
    console.error(err);
    res.status(500).json({
      message: "Soft delete donation failed",
    });
  });
}
async function updateDonation(req, res, next) {
  const userId = req.user.userId;
  const donationId = req.params.id;
  const data = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    total: req.body.total,
    lon: req.body.lon,
    lat: req.body.lat,
    updatedAt: new Date(),
    updatedBy: userId,
  };
  try {
    await isDonationOwner(req, res, async () => {
      const result = await validateAndUpdate();
      res.status(200).json({
        message: "Success update donation",
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
      description: { type: "string", optional: true },
      category: { type: "string", optional: true },
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
      const destinationFolder = "donations";
      const fileInfo = await new Promise((resolve, reject) => {
        uploadToBucket(req.file, (err, fileInfo) => {
          if (err) {
            reject(err);
          } else {
            resolve(fileInfo);
          }
        }, destinationFolder);
      });
      console.log("File uploaded to bucket:", fileInfo);
      data.image = fileInfo.imageUrl;
    }
    return updateDatabase();
  }
  // Function to update the database with the prepared data
  async function updateDatabase() {
    const donationObj = await donation.findByPk(donationId);
    if (!donationObj) {
      throw {
        message: "Donation not found",
      };
    }
    // Save the old image URL for deletion
    const oldImageUrl = donationObj.image;
    // Update the donation object with new data
    const result = await donationObj.update(data);
    await deleteOldImage(oldImageUrl);
    // Fetch the updated donation data from the database
    const updatedDonation = await donation.findByPk(donationId);
    return updatedDonation;
  }
  // Function to delete the old image from GCS
  async function deleteOldImage(oldImageUrl) {
    if (!oldImageUrl || !data.image) {
      return;
    }

    const fileName = oldImageUrl.split("/").pop();
    const bucketFile = bucket.file(`public/donations/images/${fileName}`);

    try {
      await bucketFile.delete();
      console.log("Old image deleted successfully");
    } catch (err) {
      console.error("Error deleting old image:", err);
    }
}
}
paginate.paginate(donation);

module.exports = {
    createDonation,
    getAllDonation,
    getAllClosestDonation,
    getAllDonationByUserId,
    getDetailDonation,
    deleteDonation,
    updateDonation,
};
