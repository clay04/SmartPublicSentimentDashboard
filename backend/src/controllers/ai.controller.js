import { SaveAIREsult } from "../services/ai.service";

export const ingestAI = async (req, res) => {
    try {
        const data = req.body;

        const saved = await SaveAIREsult(data);

        res.json({
            message: "AI Result Save",
            data: saved
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed" })
    }
}