const express = require('express');
const router = express.Router();
const { validateLogin } = require('../utils/validation');
const { authenticate } = require("../middleware/auth");
const { getUsersForSidebar, sendMessage, getMessages} = require ("../controllers/messageController");


router.get("/users", authenticate, getUsersForSidebar);
router.get("/:id", authenticate, getMessages);

router.post("/send/:id", authenticate, sendMessage);

module.exports = router;