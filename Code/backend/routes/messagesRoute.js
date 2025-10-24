const express = require('express');
const router = express.Router();
const { validateSignup, validateLogin } = require('../utils/validation');
const { authenticate } = require("../middleware/auth");

router.post("/send", validateLogin, authenticate, (req, res)=> {
    console.log("ciao");
});

module.exports = router;