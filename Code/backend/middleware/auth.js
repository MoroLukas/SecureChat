const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/tokenUtils');

exports.authenticate = (req, res, next) => {
  const token = req.cookies.jwt
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decodedToken = verifyToken(token);
    req.uuid = decodedToken.uuid;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};