import Chat from "../models/chat.model.js";
import prisma from "../config/prisma.js";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export const createConversation = async (user_id) => {
    try {
        const data = await prisma.conversation.create({
            data: {
                user_id: user_id,
            },
        });
        return data;
    } catch (error) {
        throw error;    
    }
};

export const addMessage = async (conversation_id, message) => {
    // conversation_id dari Prisma adalah Int, MongoDB butuh String
    const convoId = String(conversation_id);
    let chat = await Chat.findOne({ conversation_id: convoId });

    if (!chat) {
        chat = await Chat.create({
            conversation_id: convoId, 
            messages: []
        });
    }

    chat.messages.push(message);
    await chat.save(); 

    return chat;
};

export const getChatHistory = async (conversation_id) => {
    const convoId = String(conversation_id);
    const chatDoc = await Chat.findOne({ conversation_id: convoId });
    return chatDoc ? chatDoc.messages.map(m => ({ role: m.role, text: m.text })) : [];
};

// Fungsi untuk memanggil AI Engine
export const callAiEngine = async (question, chatHistory, newsContext = []) => {
    try{
        const response = await fetch(`${AI_ENGINE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": INTERNAL_API_KEY
            },
            body: JSON.stringify({
                question: question,
                chat_history: chatHistory,
                news_context: newsContext
            })
        });

        if (!response.ok) {
            throw new Error(`AI Engine mengembalikan status ${response.status}`);
        }

        return await response.json();
    } catch(error){
        throw new Error(`AI Engine Error: ${error.message}`);
    }
};

