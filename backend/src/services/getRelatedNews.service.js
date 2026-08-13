import AIResult from "../models/aiResult.model.js";

const TRACKED_KEYWORDS = process.env.TRACKED_KEYWORDS

const extractKeywords = (text) => {
    const keywords  = TRACKED_KEYWORDS ? TRACKED_KEYWORDS.split(',') : [];

    const userText = text.toLowerCase();

    const foundKeywords = keywords.find(keyword => {
        const cleanKeyword = keyword.trim().toLowerCase();
        return userText.includes(cleanKeyword);
    });

    return foundKeywords || "";
}

export const getRelatedNewsContext = async (text) => {
    try {
        const keyword = extractKeywords(text);
        if (!keyword) return [];

        return await AIResult.find({
            $or : [
                { keyword: { $regex: keyword, $options: "i" } },
                { title: { $regex: keyword, $options: "i" } },
                { content: { $regex: keyword, $options: "i" } }
            ]
        })
        .sort({  created_at: -1 })
        .limit(5)
        .select("title content sentiment")
    } catch (error) {
        console.error("Error fetching related news:", error);
        return [];
    }
}