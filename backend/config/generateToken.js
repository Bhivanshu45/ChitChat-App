const jwt = require("jsonwebtoken");
require('dotenv').config();

const generateToken = async(payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "3d",
    });
}

module.exports = generateToken;
