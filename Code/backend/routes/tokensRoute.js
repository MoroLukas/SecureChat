const express = require('express');
const router = express.Router();
const { refreshToken } = require("../controllers/tokensController");
const { authenticate } = require("../middleware/auth");

router.post("/refreshtoken", authenticate, refreshToken);

module.exports = router;