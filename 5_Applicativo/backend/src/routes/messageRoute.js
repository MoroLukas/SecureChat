import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {sendMessage, getMessages, getContactUsers, getDecryptedMessages} from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", protectRoute, getContactUsers);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/:id/decrypted", protectRoute, getDecryptedMessages);

export default router;
