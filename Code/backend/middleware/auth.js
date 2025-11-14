const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/tokenUtils');

exports.authenticate = async (req, res, next) => {
  const token = req.cookies.jwt
  if (!token) return res.status(401).json({error: 'Unauthorized no token provided'});

  try {
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({message: "Unauthorized - Invalid Token"});
    }
    let user = await User.findById(decoded.uuid).select("-password");

    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({error: 'Token expired'});
    }
    res.status(401).json({error: 'Invalid token'});
  }
};