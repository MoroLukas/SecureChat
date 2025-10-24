const jwt = require('jsonwebtoken');

const secret = process.env.ACCESS_TOKEN_SECRET;
const expires = process.env.ACCESS_TOKEN_EXPIRES;

exports.generateToken = (user) => {
  return jwt.sign({ id: user._id }, secret, { expiresIn: expires || '1h' });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, secret);
};
exports.generateTokenAndCookie = (userUUID, res) => {
	const token = jwt.sign({ userUUID }, secret, {
		expiresIn: "30d",
	});

	res.cookie("jwt", token, {
		maxAge: 30 * 24 * 60 * 60 * 1000, // MS
		httpOnly: true,
		sameSite: "strict",
		secure: process.env.NODE_ENV !== "development",
	});
};