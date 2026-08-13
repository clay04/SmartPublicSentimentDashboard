import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    conversation_id: { type: String, required: true, unique: true },
    messages: [
        {
            role: { type: String, enum: ['user', 'assistant'], required: true },
            text: { type: String, required: true },
            created_at: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

export default mongoose.model("Chat", ChatSchema);