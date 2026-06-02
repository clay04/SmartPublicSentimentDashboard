import mongoose from "mongoose";

const AIResultSchema = new mongoose.Schema({
    title: String,
    content: String,
    keyword: String,
    source: String,

    sentiment: String,
    summary: String,
    urgency: String,
    recommendation: String,

    created_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("AIResult", AIResultSchema);