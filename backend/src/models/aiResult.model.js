import mongoose from "mongoose";

const AIResultSchema = new mongoose.Schema({
    title: String,
    content: String,
    keyword: String,
    source: String,

    sentiment: String,
    category: String,

    urgency: String,

    recommendation: String,

    regulation_context: String,
    source_document: String,

    location: String,
    latitude: Number,
    longitude: Number,

    created_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("AIResult", AIResultSchema);