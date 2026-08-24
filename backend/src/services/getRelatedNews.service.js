import AIResult from "../models/aiResult.model.js";

const TRACKED_KEYWORDS = process.env.TRACKED_KEYWORDS || "";

const extractKeywords = (text) => {
  const keywords = TRACKED_KEYWORDS.split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const userText = text.toLowerCase();

  const found = keywords.find((keyword) =>
    userText.includes(keyword.toLowerCase())
  );

  return found || "";
};

export const getRelatedNewsContext = async (text) => {
  try {
    const keyword = extractKeywords(text);

    if (!keyword) return [];

    const news = await AIResult.find({
      $or: [
        { keyword: { $regex: keyword, $options: "i" } },
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ],
    })
      .sort({ created_at: -1 })
      .limit(5)
      .select(`
        _id
        title
        content
        location
        latitude
        longitude
        sentiment
        category
        urgency
        source
        created_at
      `)
      .lean();

    return news.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        content: item.content,
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        sentiment: item.sentiment,
        category: item.category,
        urgency: item.urgency,
        source: item.source,
        created_at: item.created_at
    }));
  } catch (error) {
    console.error("Error fetching related news:", error);
    return [];
  }
};