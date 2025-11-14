const jwt = require('jsonwebtoken');

const secret = process.env.ACCESS_TOKEN_SECRET;
const refresh_secret = process.env.REFRESH_TOKEN_SECRET;
const access_token_expires = process.env.ACCESS_TOKEN_EXPIRES;
const refresh_token_expires = process.env.REFRESH_TOKEN_EXPIRES;
const cookie_max_age = process.env.COOKIE_MAX_AGE;

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

exports.generateCookie = (accessToken) =>{
	res.cookie("accessToken", accessToken, {
		maxAge: cookie_max_age,
		httpOnly: true,
		sameSite: "strict",
		secure: process.env.NODE_ENV !== "development",
	  });
}

exports.generateTokenAndCookie = (userId, res) => {
	const token = jwt.sign({ userId }, secret, {
		expiresIn: access_token_expires,
	});

	res.cookie("jwt", token, {
		maxAge: cookie_max_age,
		httpOnly: true,
		sameSite: "strict",
		secure: process.env.NODE_ENV !== "development",
	});
};