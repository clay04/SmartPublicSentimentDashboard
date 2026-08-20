import { SaveBulkAIResults } from "../services/ai.service.js";

export const ingestAI = async (req, res) => {
    try {
        const savedDocs = await SaveBulkAIResults([req.body]);
        res.json({
            message: "AI Result Saved",
            data: savedDocs[0]
        });
    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({ error: "Failed to save single item" });
    }
};

export const bulkIngestAI = async (req, res) => {
    try {
        console.log("🔥 AI BULK INGEST HIT");
        const items = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Payload must be a non-empty array" });
        }

        const savedDocs = await SaveBulkAIResults(items);
        console.log(`✅ BULK SAVED TO DB: ${savedDocs.length} items`);

        res.status(201).json({
            message: "AI Bulk Results Saved",
            count: savedDocs.length,
            data: savedDocs
        });
    } catch (err) {
        console.error("❌ BULK ERROR:", err);

        if (err.insertedDocs && err.insertedDocs.length > 0) {
            return res.status(207).json({
                message: "Partial AI Bulk Results Saved",
                count: err.insertedDocs.length,
                error: err.message
            });
        }

        res.status(500).json({ error: "Failed to save bulk data" });
    }
};