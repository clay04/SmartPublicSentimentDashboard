import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    conversation_id: String,
    message: [
        {
            role: String,
            text: String,
            created_at: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

export default mongoose.model("Chat", ChatSchema);