const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

function auth(requiredRole) {
    return function(req, res, next) {
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

                // Pemeriksaan peran pengguna dan ID yang diminta
                if (user && user.role === requiredRole && (req.params.id === user.userid.toString())) {
                    req.user = user;
                    next();
                } else {
                    return res.status(403).json({
                        message: "Unauthorized. Insufficient role or invalid ID."
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
