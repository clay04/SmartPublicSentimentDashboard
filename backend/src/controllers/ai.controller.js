import { SaveAIREsult } from "../services/ai.service.js";

export const ingestAI = async (req, res) => {
    try {
        console.log("🔥 AI INGEST HIT");
        console.log("📦 BODY:", req.body);

        const data = req.body;

        const saved = await SaveAIREsult(data);

        console.log("✅ SAVED TO DB:", saved._id);

        res.json({
            message: "AI Result Save",
            data: saved
        });

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({ error: "Failed" });
    }
};