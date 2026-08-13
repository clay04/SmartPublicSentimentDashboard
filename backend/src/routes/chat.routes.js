import express from "express"
import { startConversation, sendMessage } from "../controllers/chat.controller.js"
import { authenticate } from "../middlewares/auth.middleware.js"

const router = express.Router();

// Semua route chat butuh autentikasi
router.post("/start", authenticate, startConversation);
router.post("/message", authenticate, sendMessage)

export default router;