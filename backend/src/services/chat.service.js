import Chat from "../models/chat.model";
import supabase from "../config/supabase";

export const createConversation = async (user_id) => {
    const { data, error } = await supabase
    .from("conversation")
    .insert([{ user_id }])
    .select()
    .single();

    if (error) throw error;

    return data;
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