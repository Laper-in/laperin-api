const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

function auth() {
    return function (req, res, next) {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            console.log(authHeader);
            const token = authHeader.split(' ')[1];

            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(403).json({
                        message: "Invalid Token !!!"
                    });
                }

                // Check if the user is trying to update their own information
                if (user && req.params.id === user.userid.toString()) {
                    req.user = user;
                    next();
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
