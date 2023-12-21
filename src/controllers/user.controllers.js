const { user } = require("../database/models");
const { uploadToBucket, bucket } = require("../middlewares/gcsMiddleware");
const Validator = require("fastest-validator");
const validateUser = require("../validators/validator");
const v = new Validator();
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
require("dotenv").config();
const {
  generateAccessToken,
  clearToken,
  authData,
  isUserOwner,
  isAdmin,
  isUserDeleted,
} = require("../middlewares/auth");
const paginate = require("sequelize-paginate");

async function signUp(req, res) {
  console.log("Entire Request Body:", req.body);
  const { username, email, password } = req.body;

  // Validate user input
  const validation = await validateUser({ email, username ,password });
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(404)
        .json({ error: "User with this email already exists" });
    }
    const trimmedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const newUser = await user.create({
      username,
      email,
      role: "user",
      isDeleted: false,
      password: hashedPassword,
    });

    // Uncomment code below if you want to generate access and refresh tokens
    const accessToken = generateAccessToken(newUser);
    // const refreshToken = generateRefreshToken(newUser);

    return res.status(200).json({
      message: `Register user with usernames ${username} Success`,
      accessToken,
      data: newUser,
      // refreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
async function signIn(req, res) {
  const { username, password } = req.body;

  try {
    const foundUser = await user.findOne({ where: { username } });
    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const userDeleted = await isUserDeleted(foundUser.id);
    if (userDeleted) {
      return res
        .status(403)
        .json({ error: "Forbidden: User account has been deleted" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const accessToken = generateAccessToken(foundUser);
    const userResponse = {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role,
    };
    res.status(200).json({
      message: `Login User ID ${foundUser.id} Success`,
      accessToken,
      data: userResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function signOut(req, res) {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token not provided" });
    }
    if (authData.blacklistedTokens.includes(token)) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token has been revoked" });
    }
    if (req.user && req.user.userId && req.user.username) {
      const { userId, username } = req.user;
      // Clear (blacklist) the token
      clearToken(token);
      res.status(200).json({
        message: `Sign-out successful for user ID ${userId} Usernames ${username}`,
        userId,
        usernames,
      });
    } else {
      res
        .status(401)
        .json({ error: "Unauthorized: User information not available" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getAllUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await user.paginate({
      page: page,
      paginate: pageSize,
      where: { isDeleted: false },
    });

    const response = {
      message: "Get All Users Success",
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
async function getDetailUsers(req, res) {
  // Assuming the JWT is stored in the Authorization header
  const userId = req.user.userId; // This assumes that your middleware has already decoded the JWT and added the user information to the request object

  try {
    // Now you can use the userId to fetch user details
    const users = await user.findByPk(userId);

    if (!users) {
      return res.status(404).json({ message: "User not found", data: null });
    }

    res
      .status(200)
      .json({ message: `Get Detail ID ${userId} Success`, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function updateUsers(req, res, next) {
  const userId = req.user.userId;
  const data = {
    email: req.body.email,
    fullname: req.body.fullname,
    alamat: req.body.alamat,
    telephone: req.body.telephone,
    updatedAt: new Date(),
    updatedBy: userId,
  };

  try {
    // Check if the password field is provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      data.password = hashedPassword; // Set the hashed password in the data object
    }

    // Continue with the validation and update
    await validateAndUpdate(bucket);

    res.status(200).json({
      message: "Success update data",
      // data: data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Update Failed",
      // data: error,
    });
  }
  // Function to perform the validation and update
  async function validateAndUpdate() {
    const schema = {
      fullname: { type: "string",min: 5, max: 100, optional: true  },
      alamat: { type: "string", min: 5, max: 255, optional: true },
      telephone: { type: "string", min: 10, max: 14, optional: true },
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
      const destinationFolder = "users";
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

      // Update the image field with the file information
      data.image = fileInfo.imageUrl;
    }

    // Update the database with the prepared data
    await updateDatabase(bucket);
  }
  // Function to update the database with the prepared data
  async function updateDatabase() {
    const userObj = await user.findByPk(req.user.userId);
    if (!userObj) {
      throw {
        message: "User not found",
      };
    }

    // Save the old image URL for deletion
    const oldImageUrl = userObj.image;

    // Update the user object with new data
    const result = await userObj.update(data);

    await deleteOldImage(oldImageUrl, bucket);

    return result;
  }
  // Function to delete old image from Google Cloud Storage
  async function deleteOldImage(oldImageUrl, bucket) {
    if (!oldImageUrl || !data.image) {
      return;
    }
    const fileName = oldImageUrl.split("/").pop();
    const bucketFile = bucket.file(`public/users/images/${fileName}`);
    try {
      await bucketFile.delete();
      console.log("Old image deleted successfully");
    } catch (err) {
      console.error("Error deleting old image:", err);
    }
  }
}
async function deleteUsers(req, res) {
  const userIdToDelete = req.params.id;
  try {
    isAdmin(req, res, async () => {
      const userToDelete = await user.findByPk(userIdToDelete);

      if (!userToDelete) {
        return res.status(404).json({ error: "User not found" });
      }
      if (userToDelete.isDeleted || userToDelete.deletedAt) {
        return res
          .status(400)
          .json({ message: "User has already been deleted" });
      }
      if (userToDelete.role === "admin") {
        return res
          .status(403)
          .json({ error: "Forbidden: Cannot delete an admin user" });
      }
      const deletedByUserId = req.user.userId;
      await user.update(
        { isDeleted: true, deletedBy: deletedByUserId, deletedAt: new Date() },
        { where: { id: userIdToDelete } }
      );
      res.status(200).json({
        message: `Soft Delete Success for user with ID ${userIdToDelete}`,
        data: userToDelete,
        deletedBy: deletedByUserId,
        deletedAt: new Date(),
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function searchUser(req, res, next) {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["username", "ASC"]];

    if (searchTerm) {
      order = []; // Reset the order for custom search terms
    }

    const result = await user.paginate({
      page: page,
      paginate: pageSize,
      where: {
        username: {
          [Op.like]: `%${searchTerm}%`,
        },
      },
      order: order,
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      current_page: result.page,
      data: result.docs,
    };

    if (result.docs.length === 0) {
      return res.status(404).json({
        message: "User not found",
        result: response,
      });
    }

    res.status(200).json({
      message: "Success Search",
      result: response,
    });
  } catch (err) {
    res.status(500).json({
      message: "Search By Name Failed",
      data: err,
    });
  }
}
async function setStatusOnline(req, res) {
  const userIdToUpdate = req.user.userId;
  const { isOnline } = req.body;

  try {
    const userToUpdate = await user.findByPk(userIdToUpdate);

    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.update({ isOnline }, { where: { id: userIdToUpdate } });

    res.status(200).json({
      message: `User status updated successfully for user with ID ${userIdToUpdate}`,
      data: { userId: userIdToUpdate, isOnline },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

paginate.paginate(user);
module.exports = {
  signUp,
  signIn,
  signOut,
  getAllUsers,
  getDetailUsers,
  updateUsers,
  deleteUsers,
  searchUser,
  setStatusOnline,
};
