import express from "express"
import { startCOnversation, sendMessage } from "../controllers/chat.controller.js"

const router = express.Router();

router.post("/start", startCOnversation);
router.post("/message", sendMessage)

export default router;