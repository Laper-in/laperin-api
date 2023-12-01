const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { User } = require('../models');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

function auth() {
    return async function (req, res, next) {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            console.log(authHeader);
            const token = authHeader.split(' ')[1];

            jwt.verify(token, JWT_SECRET, async (err, user) => {
                if (err) {
                    return res.status(403).json({
                        message: "Invalid Token !!!"
                    });
                }

                // Check if the user is trying to update their own information
                if (user) {
                    req.user = user;

                    // Check if the user has the necessary permissions
                    if (user.role === 'user') {
                        if (req.method === 'DELETE') {
                            // Allow deletion only if the requested user ID matches the ID in the token
                            if (req.params.id && req.params.id === user.userid.toString()) {
                                next();
                            } else {
                                return res.status(403).json({
                                    message: "Unauthorized. You can only delete your own account."
                                });
                            }
                        } else {
                            // Allow access only if the requested user ID matches the ID in the token
                            if (req.params.id && req.params.id === user.userid.toString()) {
                                next();
                            } else {
                                return res.status(403).json({
                                    message: "Unauthorized. You can only read/update your own information."
                                });
                            }
                        }
                    } else {
                        // Admins or other roles can proceed
                        next();
                    }
                } else {
                    return res.status(403).json({
                        message: "Unauthorized. You can only update your own information."
                    });
                }
            });
        } else {
            return res.status(401).json({
                message: "Invalid or Expired Token !!!"
            });
        }
    };
}

module.exports = {
    auth: auth
};
