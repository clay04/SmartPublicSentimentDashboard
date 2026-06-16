import Chat from "../models/chat.model.js";
import prisma from "../config/prisma.js";

export const createConversation = async (user_id) => {
    try {
        // 🌟 SEKARANG PAKAI PRISMA! Jauh lebih clean dan aman
        const data = await prisma.conversation.create({
            data: {
                user_id: user_id, // atau cukup tulis user_id jika nama field-nya sama
            },
        });

        return data;
    } catch (error) {
        throw error;
    }
};

export const addMessage = async (conversation_id, message) => {
    let chat = await Chat.findOne({ conversation_id });

    if (!chat) {
        chat = await Chat.create({
            conversation_id, 
            messages: []
        });
    }

    chat.messages.push(message);
    await chat.save(); 

    return chat;
}