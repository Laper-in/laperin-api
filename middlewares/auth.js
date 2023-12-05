    // auth.js
    const jwt = require("jsonwebtoken");
    const dotenv = require("dotenv");
    const { User } = require("../models");

    dotenv.config();
    const JWT_SECRET = process.env.JWT_SECRET;

    function auth() {
    return async function (req, res, next) {
        const authHeader = req.headers.authorization;

        if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, JWT_SECRET, async (err, user) => {
            if (err) {
            console.error(err);
            return res.status(403).json({
                message: "Invalid Token !!!",
            });
            }

            // Log the decoded user for debugging
            console.log("Decoded User:", user);

            // Attach user information to the request object
            req.user = user;

            // Check if the user has the necessary permissions
            if (user.role === "user") {
            // Allow DELETE requests without matching user IDs
            if (req.method === "DELETE") {
                next();
            } else {
                // Ensure idUser in the request payload matches userid in the token for other methods
                if (
                (req.body.idUser && req.body.idUser === user.userid.toString()) ||
                (req.params.id && req.params.id === user.userid.toString())
                ) {
                next();
                } else {
                return res.status(403).json({
                    message: "Unauthorized. User IDs do not match.",
                });
                }
            }
            } else {
            // Admins or other roles can proceed
            next();
            }
        });
        } else {
        return res.status(401).json({
            message: "Invalid or Expired Token !!!",
        });
        }
    };
    }

    module.exports = {
    auth: auth,
    };
