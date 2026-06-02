import { createConversation, addMessage } from "../services/chat.service";

export const startCOnversation = async (req, res) => {
    try {
        const { user_id } = req.body;

        const convo = await createConversation(user_id);

        res.json(convo);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { conversation_id, role, text } = req.body;

        const chat = await addMessage(conversation_id, {
            role,
            text
        });

        res.json(chat);

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};