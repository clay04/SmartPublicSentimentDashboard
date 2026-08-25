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

        if (!conversation_id || !text?.trim()) {
            return res.status(400).json({
                error: "conversation_id and text are required"
            });
        }

        await addMessage(
            conversation_id,
            {
                role: "user",
                text: text.trim()
            }
        );

        const chatHistory =
            await getChatHistory(conversation_id);

        const newsContext =
            await getRelatedNewsContext(text);


        console.log(
            "📰 News context:",
            newsContext
        );

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

        await addMessage(
            conversation_id,
            {
                role: "assistant",
                text: aiResponse.answer
            }
        );

        return res.json({
            status: "success",
            answer: aiResponse.answer,
            source_document:
                aiResponse.source_document ?? null,
            model_used:
                aiResponse.model_used ?? null,
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