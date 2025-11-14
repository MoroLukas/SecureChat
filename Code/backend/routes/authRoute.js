const express = require('express');
const router = express.Router();
const { validateSignup, validateLogin } = require('../utils/validation');
const { login, logout, signup, checkAuth} = require("../controllers/authController");

router.post("/login", validateLogin, login);
router.post("/logout", logout);
router.post("/register", validateSignup, signup);

router.get("/checkaut", validateLogin, checkAuth);

module.exports = router;
