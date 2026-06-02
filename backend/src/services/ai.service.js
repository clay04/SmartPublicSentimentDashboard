import AIResult from "../models/aiResult.model.js";

export const SaveAIREsult = async (data) => {
    return await AIResult.create(data);
}