const express = require('express');
const router = express.Router();
const { validateSignup, validateLogin } = require('../utils/validation');
const { login, logout, signup } = require("../controllers/authController");

router.post("/login", validateLogin, login);
router.post("/logout", logout);
router.post("/register", validateSignup, signup);

module.exports = router;
