import express from "express"
import { startCOnversation, sendMessage } from "../controllers/chat.controller"

const router = express.Router();

router.post("/start", startCOnversation);
router.post("/message", sendMessage)

export default router;