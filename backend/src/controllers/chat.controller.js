import {
    createConversation,
    addMessage,
    getChatHistory,
    callAiEngine
} from "../services/chat.service.js";

import {
    getRelatedNewsContext
} from "../services/getRelatedNews.service.js";


export const startConversation = async (req, res) => {
    try {

        const user_id = req.user.id;

        const convo = await createConversation(user_id);

        res.json(convo);

    } catch (err) {

        console.error("❌ startConversation error:", err);

        res.status(500).json({
            error: err.message
        });
    }
};


export const sendMessage = async (req, res) => {

    try {

        const {
            conversation_id,
            text
        } = req.body;


        // ============================================
        // 1. VALIDASI REQUEST
        // ============================================

        if (!conversation_id || !text?.trim()) {

            return res.status(400).json({
                error: "conversation_id and text are required"
            });

        }


        // ============================================
        // 2. SIMPAN PESAN USER
        // ============================================

        await addMessage(
            conversation_id,
            {
                role: "user",
                text: text.trim()
            }
        );


        // ============================================
        // 3. AMBIL CHAT HISTORY
        // ============================================

        const chatHistory =
            await getChatHistory(conversation_id);


        // ============================================
        // 4. AMBIL BERITA TERKAIT
        // ============================================

        const newsContext =
            await getRelatedNewsContext(text);


        console.log(
            "📰 News context:",
            newsContext
        );


        // ============================================
        // 5. PANGGIL AI ENGINE
        // ============================================

        const aiResponse =
            await callAiEngine(
                text,
                chatHistory,
                newsContext
            );


        console.log(
            "🤖 AI response:",
            aiResponse
        );


        // ============================================
        // 6. SIMPAN JAWABAN AI
        // ============================================

        await addMessage(
            conversation_id,
            {
                role: "assistant",
                text: aiResponse.answer
            }
        );


        // ============================================
        // 7. KIRIM RESPONSE KE FRONTEND
        // ============================================

        return res.json({

            status: "success",

            answer: aiResponse.answer,

            source_document:
                aiResponse.source_document ?? null,

            model_used:
                aiResponse.model_used ?? null,

            // 🔥 PENTING UNTUK MAP NAVIGATION
            map_action:
                aiResponse.map_action ?? null

        });


    } catch (err) {

        console.error(
            "❌ sendMessage error:",
            err
        );

        return res.status(500).json({
            error: err.message
        });

    }
};