import express from "express";
import { ingestAI } from "../controllers/ai.controller";

const router = express.Router();

router.post("/ingest", ingestAI)

export default router;