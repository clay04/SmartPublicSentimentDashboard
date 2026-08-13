import express from "express";
import { getNews } from "../controllers/news.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Proteksi endpoint dengan middleware JWT authenticate
router.get("/getnews", authenticate, getNews);

export default router;