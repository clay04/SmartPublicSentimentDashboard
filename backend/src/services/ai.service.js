import AIResult from "../models/aiResult.model.js";

export const SaveAIREsult = async (data) => {
    return await AIResult.create(data);
};

// 🔥 Tambahan fungsi Bulk Ingest
export const SaveBulkAIResults = async (items) => {
    return await AIResult.insertMany(items, { ordered: false });
};