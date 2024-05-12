// utils/jwt.js

const jwt = require('jsonwebtoken');

const secretKey = process.env.REFRESH_TOKEN_SECRET; 
const tokenExpiration = '8h'; // Adjust the token expiration time as needed

function generateToken(data) {
  return jwt.sign(data, secretKey, { expiresIn: tokenExpiration });
}

function generateRefreshToken(data){
  return jwt.sign(data, secretKey, { expiresIn: '7d' }); 
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
}

module.exports = { generateToken, generateRefreshToken, verifyToken };