import express from "express";
import { ingestAI, bulkIngestAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/ingest", ingestAI);
router.post("/ingest-bulk", bulkIngestAI);

export default router;