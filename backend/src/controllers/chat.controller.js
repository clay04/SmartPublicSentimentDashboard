import { createConversation, addMessage, getChatHistory, callAiEngine } from "../services/chat.service.js";
import { getRelatedNewsContext } from "../services/getRelatedNews.service.js";

export const startConversation = async (req, res) => {
    try {
        // Ambil user_id dari token yang sudah terverifikasi (auth middleware)
        const user_id = req.user.id;
        const convo = await createConversation(user_id);
        res.json(convo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { conversation_id, text } = req.body;

        // Validasi conversation_id dimiliki oleh user yang login
        if (!conversation_id || !text) {
            return res.status(400).json({ error: "conversation_id and text are required" });
        }

        // 1. Simpan pesan user ke MongoDB
        await addMessage(conversation_id, { role: "user", text });

        // 2. Ambil history chat untuk dikirim ke AI
        const chatHistory = await getChatHistory(conversation_id);

        const newsContext = await getRelatedNewsContext(text);

        // 3. Panggil AI Engine
        const aiResponse = await callAiEngine(text, chatHistory, newsContext);

        // 4. Simpan jawaban AI ke MongoDB
        await addMessage(conversation_id, { role: "assistant", text: aiResponse.answer });

        // 5. Kirim respons ke frontend
        res.json({
            status: "success",
            answer: aiResponse.answer,
            source_document: aiResponse.source_document,
            model_used: aiResponse.model_used
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};