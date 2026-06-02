import AIResult from "../models/aiResult.model";

export const SaveAIREsult = async (data) => {
    return await AIResult.create(data);
}