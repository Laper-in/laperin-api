/* eslint-disable radix */
/* eslint-disable consistent-return */
const jwt = require("jsonwebtoken");
const { user, donation } = require("../database/models");
dotenv = require("dotenv");

// Array untuk menyimpan token yang telah di-blacklist
const authData = {
  blacklistedTokens: [],
};

// Function to generate access token
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isDeleted: user.isDeleted,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "60d",
    }
  );
}

// Function to generate refresh token
function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

// Middleware to authenticate access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Access token not provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid access token" });
    }

    if (user.isDeleted) {
      return res
        .status(403)
        .json({ error: "Forbidden: User account has been deleted" });
    }

    req.user = user;
    next();
  });
}

// Middleware to authenticate refresh token
function authenticateRefreshToken(req, res, next) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next();
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Forbidden: Invalid refresh token" });
    }

    req.user = user;
    next();
  });
}

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Forbidden: You do not have admin privileges" });
  }
}

// Middleware to check if the user is the owner of the requested resource or an admin
function isUserOwner(req, res, next) {
  const requestedUserId = req.params.id;
  const authenticatedUserId = req.user.userId;
  if (req.user.role === "admin" || requestedUserId === authenticatedUserId) {
    next();
  } else {
    res.status(403).json({
      error: "Forbidden: You do not have permission to access this resource",
    });
  }
}
function isUserOwnerNoRequest(req, res, next) {
  const authenticatedUserId = req.user.userId;
  console.log("Authenticated User ID:", authenticatedUserId);
  if (req.user.role === "admin" || authenticatedUserId) {
    next();
  } else {
    res.status(403).json({
      error: "Forbidden: You do not have permission to access this resource",
    });
  }
}

async function isDonationOwner(req, res, next) {
  const requestedDonationId = req.params.id;
  const authenticatedUserId = req.user.userId;

  try {
    const donationObj = await donation.findByPk(requestedDonationId);

    if (!donationObj) {
      return res.status(404).json({
        error: "Donation not found",
      });
    }

    // Check if the authenticated user is the owner of the donation or an admin
    if (
      req.user.role === "admin" ||
      donationObj.idUser === authenticatedUserId
    ) {
      req.donationObj = donationObj; // Attach the donation object to the request for later use
      next();
    } else {
      res.status(403).json({
        error: "Forbidden: You do not have permission to delete this donation",
      });
    }
  } catch (error) {
    console.error("Error checking donation ownership:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

// Middleware to check if the user is deleted
async function isUserDeleted(userId) {
  try {
    const foundUser = await user.findByPk(userId);

    if (!foundUser) {
      return true;
    }

    return foundUser.isDeleted;
  } catch (error) {
    console.error("Error checking user deletion status:", error);
    return true;
  }
}

async function checkUserDeletedBeforeLogin(req, res, next) {
  const { username, password } = req.body;
  try {
    if (!username) {
      return res
        .status(400)
        .json({ error: "Bad Request: Username is required" });
    }
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
    next();
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Middleware to check if the token is in the blacklist
function checkBlacklist(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (token && authData.blacklistedTokens.includes(token)) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Token has been revoked" });
  }
  next();
}

// Function to add a token to the blacklist
function clearToken(token) {
  authData.blacklistedTokens.push(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  authenticateRefreshToken,
  isAdmin,
  isUserOwner,
  isUserDeleted,
  checkUserDeletedBeforeLogin,
  checkBlacklist,
  clearToken,
  authData,
  isDonationOwner,
  isUserOwnerNoRequest,
};
