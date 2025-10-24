const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/tokenUtils');

exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
  
    try {
      const decoded = verifyToken(refreshToken);
  
      const newAccessToken = generateAccessToken({ _id: decoded.id });
      const newRefreshToken = generateRefreshToken({ _id: decoded.id });

      res.cookie("refreshToken", newRefreshToken, { httpOnly: true, sameSite: "strict" });
      res.json({ accessToken: newAccessToken });
  
    } catch (err) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }
};
  