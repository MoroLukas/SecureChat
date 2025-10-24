const jwt = require('jsonwebtoken');

const secret = process.env.ACCESS_TOKEN_SECRET;
const refresh_secret = process.env.REFRESH_TOKEN_SECRET;
const access_token_expires = process.env.ACCESS_TOKEN_EXPIRES;
const refresh_token_expires = process.env.REFRESH_TOKEN_EXPIRES;

exports.verifyToken = (token) => {
  return jwt.verify(token, secret);
};

exports.generateAccessToken = (user) =>{
    return jwt.sign({ user }, secret, {
		expiresIn: access_token_expires,
	});
}

exports.generateRefreshToken = (user) =>{
    return jwt.sign({ user }, refresh_secret, {
		expiresIn: refresh_token_expires,
	});
}