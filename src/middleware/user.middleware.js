const jwt = require('jsonwebtoken');

const author = async (req, res, next) => {
    try {
        
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Token missing." });
        }

       
        const decoded = jwt.verify(token, process.env.JWT_SEC);

        
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Unauthorized. Invalid token data." });
        }

       
        req.user = decoded;
        console.log("Decoded user:", decoded);

        next();
    } catch (error) {
        console.error("Authorization error:", error);

       
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized. Token expired." });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Unauthorized. Invalid token." });
        }

     
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = author;
